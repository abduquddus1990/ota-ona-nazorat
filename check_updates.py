import urllib.request, json
BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"
url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates?offset=-10"
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    print("Recent Updates Count:", len(data.get('result', [])))
    for upd in data.get('result', []):
        msg = upd.get('message') or upd.get('callback_query', {}).get('message')
        from_user = upd.get('message', {}).get('from') or upd.get('callback_query', {}).get('from')
        print("Update ID:", upd.get('update_id'), "From:", from_user, "Text:", msg.get('text') if msg else None)
