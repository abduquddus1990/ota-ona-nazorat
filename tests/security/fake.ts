// Xotiradagi soxta PostgREST (Supabase) va Telegram API — security_test.ts uchun.
// supabase-js yuboradigan so'rovlarning faqat server ishlatadigan qismi.
export const DB: Record<string, any[]> = {};
export const TG: any[] = [];

const DEFAULTS: Record<string, Record<string, unknown>> = {
  device_tokens: { is_active: true },
  app_login_requests: { status: "pending" },
  join_attempts: { succeeded: false },
  child_pairings: { is_active: true },
  security_events: { detail: {} },
};
// Ustunlari ma'lum jadvallar — noma'lum ustun = PGRST204 (migratsiya yo'q holatini sinash uchun).
export const STRICT_COLS: Record<string, string[] | undefined> = {};

function tbl(n: string) { return (DB[n] ||= []); }

function cmp(a: any, b: string): number {
  const na = Number(a), nb = Number(b);
  if (a !== null && a !== "" && !isNaN(na) && b !== "" && !isNaN(nb) && typeof a !== "boolean") return na - nb;
  const sa = String(a);
  return sa < b ? -1 : sa > b ? 1 : 0;
}

function test(row: any, col: string, expr: string): boolean {
  let neg = false;
  let e = expr;
  if (e.startsWith("not.")) { neg = true; e = e.slice(4); }
  const i = e.indexOf(".");
  const op = e.slice(0, i);
  const val = decodeURIComponent(e.slice(i + 1));
  const rv = row[col];
  let r: boolean;
  switch (op) {
    case "eq": r = rv != null && String(rv) === val; break;
    case "neq": r = rv != null && String(rv) !== val; break;
    case "is": r = val === "null" ? rv == null : val === "true" ? rv === true : rv === false; break;
    case "gt": r = rv != null && cmp(rv, val) > 0; break;
    case "gte": r = rv != null && cmp(rv, val) >= 0; break;
    case "lt": r = rv != null && cmp(rv, val) < 0; break;
    case "lte": r = rv != null && cmp(rv, val) <= 0; break;
    case "like": case "ilike": {
      const re = new RegExp("^" + val.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/[%*]/g, ".*") + "$", op === "ilike" ? "i" : "");
      r = rv != null && re.test(String(rv)); break;
    }
    case "in": {
      const list = val.replace(/^\(|\)$/g, "").split(",").map((x) => x.replace(/^"|"$/g, ""));
      r = rv != null && list.includes(String(rv)); break;
    }
    default:
      console.warn("FAKE: noma'lum filtr", col, expr);
      r = true;
  }
  return neg ? !r : r;
}

function filtersOf(sp: URLSearchParams): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [k, v] of sp) {
    if (["select", "order", "limit", "offset", "columns", "on_conflict"].includes(k)) continue;
    out.push([k, v]);
  }
  return out;
}

function matchAll(row: any, f: Array<[string, string]>) {
  return f.every(([c, e]) => {
    if (c === "or") {
      const inner = e.replace(/^\(|\)$/g, "").split(",");
      return inner.some((p) => { const j = p.indexOf("."); return test(row, p.slice(0, j), p.slice(j + 1)); });
    }
    return test(row, c, e);
  });
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status, headers: { "content-type": "application/json", ...extra },
  });
}

export async function fakeRest(url: URL, init: RequestInit): Promise<Response> {
  const m = url.pathname.match(/\/rest\/v1\/(.+)$/);
  if (!m) return json({ message: "fake: noma'lum yo'l " + url.pathname }, 404);
  const name = m[1];
  if (name.startsWith("rpc/")) return json(null);
  const method = (init.method || "GET").toUpperCase();
  const h = new Headers(init.headers as any);
  const prefer = h.get("prefer") || "";
  const single = (h.get("accept") || "").includes("vnd.pgrst.object");
  const f = filtersOf(url.searchParams);
  const rows = tbl(name);
  const ret = (list: any[], status = 200) => {
    const extra: Record<string, string> = { "content-range": `0-${Math.max(0, list.length - 1)}/${list.length}` };
    if (single) {
      if (list.length !== 1) return json({ code: "PGRST116", message: "single: " + list.length + " qator" }, 406);
      return json(structuredClone(list[0]), status, extra);
    }
    return json(structuredClone(list), status, extra);
  };
  const wantRep = prefer.includes("return=representation");

  if (method === "GET" || method === "HEAD") {
    let list = rows.filter((r) => matchAll(r, f));
    const order = url.searchParams.get("order");
    if (order) {
      const keys = order.split(",").map((o) => o.split("."));
      list = [...list].sort((a, b) => {
        for (const [c, dir] of keys) {
          const x = a[c], y = b[c];
          if (x === y) continue;
          const s = x == null ? 1 : y == null ? -1 : (x < y ? -1 : 1);
          return dir === "desc" ? -s : s;
        }
        return 0;
      });
    }
    const off = Number(url.searchParams.get("offset") || 0);
    const lim = url.searchParams.get("limit");
    list = list.slice(off, lim ? off + Number(lim) : undefined);
    if (method === "HEAD") return new Response(null, { status: 200, headers: { "content-range": `0-0/${list.length}` } });
    return ret(list);
  }

  if (method === "POST") {
    const body = JSON.parse(String(init.body || "null"));
    const items = Array.isArray(body) ? body : [body];
    const strict = STRICT_COLS[name];
    if (strict) {
      for (const it of items) for (const k of Object.keys(it)) {
        if (!strict.includes(k)) return json({ code: "PGRST204", message: `Could not find the '${k}' column of '${name}' in the schema cache` }, 400);
      }
    }
    const onConflict = url.searchParams.get("on_conflict");
    const merge = prefer.includes("resolution=merge-duplicates");
    const out: any[] = [];
    for (const it of items) {
      if (onConflict && merge) {
        const cols = onConflict.split(",");
        const ex = rows.find((r) => cols.every((c) => String(r[c]) === String(it[c])));
        if (ex) {
          for (const [k, v] of Object.entries(it)) if (v !== undefined) ex[k] = v;
          out.push(ex);
          continue;
        }
      }
      const row: any = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...(DEFAULTS[name] || {}) };
      for (const [k, v] of Object.entries(it)) if (v !== undefined) row[k] = v;
      if (name === "security_events") row.id = rows.length + 1;
      rows.push(row);
      out.push(row);
    }
    return wantRep ? ret(out, 201) : new Response(null, { status: 201 });
  }

  if (method === "PATCH") {
    const patch = JSON.parse(String(init.body || "{}"));
    const list = rows.filter((r) => matchAll(r, f));
    for (const r of list) for (const [k, v] of Object.entries(patch)) r[k] = v;
    return wantRep ? ret(list) : new Response(null, { status: 204 });
  }

  if (method === "DELETE") {
    const list = rows.filter((r) => matchAll(r, f));
    DB[name] = rows.filter((r) => !list.includes(r));
    return wantRep ? ret(list) : new Response(null, { status: 204 });
  }
  return json({ message: "fake: metod " + method }, 405);
}

export function installFetch(supabaseUrl: string) {
  const real = globalThis.fetch;
  globalThis.fetch = (async (input: any, init: any = {}) => {
    const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!(typeof input === "string" || input instanceof URL)) {
      init = { method: input.method, headers: input.headers, body: init.body ?? (input.body ? await input.text() : undefined), ...init };
    }
    if (href.startsWith("https://api.telegram.org/")) {
      const method = href.split("/").pop();
      let body: any = {};
      try { body = init.body ? JSON.parse(String(init.body)) : {}; } catch { body = { raw: String(init.body) }; }
      TG.push({ method, ...body });
      return json({ ok: true, result: method === "getChat" ? { id: body.chat_id } : { message_id: TG.length } });
    }
    if (href.startsWith(supabaseUrl)) return fakeRest(new URL(href), init);
    return real(input, init);
  }) as typeof fetch;
  return real;
}
