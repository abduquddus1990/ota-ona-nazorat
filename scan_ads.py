import os
for root, dirs, files in os.walk('.'):
    if '.git' in root: continue
    for f in files:
        if f.endswith(('.html', '.js', '.py')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as fl:
                c = fl.read()
                for keyword in ['script src="http', 'iframe', 'adsbygoogle', 'yandex', 'advert']:
                    if keyword in c.lower():
                        print(f'Match in {p}: {keyword}')
print("Codebase scan complete.")
