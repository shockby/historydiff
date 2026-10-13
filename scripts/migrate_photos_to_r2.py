#!/usr/bin/env python3
"""photos.json のローカル画像参照 (/images/events/...) を Cloudflare R2 へアップロードし、URL を R2 に書き換える。

- ローカルファイル (public/images/events/...) は削除しない
- 書き換えは文字列置換のため、JSON の整形は維持される
- 前提: `wrangler` が認証済み (OAuth: `wrangler login` / または CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID)

使い方: python3 scripts/migrate_photos_to_r2.py [--dry-run]
"""
import glob, json, mimetypes, os, subprocess, sys, time, urllib.request

BUCKET = "historydiff-photos"
R2_BASE = "https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev"
WRANGLER = "./node_modules/.bin/wrangler"
CT = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif"}
dry = "--dry-run" in sys.argv


def upload(key, path, ctype):
    for i in range(3):
        r = subprocess.run([WRANGLER, "r2", "object", "put", f"{BUCKET}/{key}", f"--file={path}", f"--content-type={ctype}", "--remote"], capture_output=True, text=True, timeout=180)
        if r.returncode == 0:
            return True
        print(f"  retry {i+1}: {r.stderr.strip()[-200:]}")
        time.sleep(2)
    return False


def check(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        return urllib.request.urlopen(req, timeout=30).status == 200
    except Exception as e:
        print("  check failed:", e)
        return False


failed = 0
for f in sorted(glob.glob("content/events/*/photos.json")):
    text = open(f, encoding="utf-8").read()
    changed = False
    for p in json.loads(text)["photos"]:
        u = p["url"]
        if not u.startswith("/images/"):
            continue
        key = u[len("/images/"):]
        local = "public" + u
        ext = os.path.splitext(local)[1].lower()
        ctype = CT.get(ext) or mimetypes.guess_type(local)[0] or "application/octet-stream"
        new = f"{R2_BASE}/{key}"
        print(f"{u} -> {new}")
        if dry:
            continue
        if upload(key, local, ctype) and check(new):
            text = text.replace(f'"url": "{u}"', f'"url": "{new}"')
            changed = True
        else:
            failed += 1
            print("  FAILED (URL は書き換えません)")
    if changed:
        json.loads(text)  # 妥当性確認
        open(f, "w", encoding="utf-8").write(text)
print("failed:", failed)
sys.exit(1 if failed else 0)
