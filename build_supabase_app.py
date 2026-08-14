import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()
with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Inline CSS & JS into a single super-fast self-contained HTML
standalone = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')
standalone = standalone.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')

out_dir = os.path.join('supabase', 'functions', 'ota-ona-app')
os.makedirs(out_dir, exist_ok=True)

# Escape backticks and template expressions
escaped_html = standalone.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

ts_content = f"""import {{ serve }} from "https://deno.land/std@0.168.0/http/server.ts";

const HTML = `{escaped_html}`;

serve((req) => {{
  return new Response(HTML, {{
    headers: {{
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    }},
  }});
}});
"""

with open(os.path.join(out_dir, 'index.ts'), 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"ota-ona-app Edge Function muvaffaqiyatli yaratildi! Hajmi: {len(ts_content)} bayt")
