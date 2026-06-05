import os
import re
import urllib.request
import urllib.parse
import json
import time

content_dir = 'content/events'

# 残り4イベント（韓国視点あり）
TARGET_EVENTS = [
    'fukushima-treated-water',
    'high-speed-rail-controversy',
    'pacific-war-end',
    'ww2-asia',
]

def translate_text(text, target_lang='ko'):
    if not text.strip():
        return text
    for attempt in range(5):
        try:
            q = urllib.parse.quote(text)
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl={target_lang}&dt=t&q={q}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=10)
            data = json.loads(res.read().decode('utf-8'))
            translated = "".join(item[0] for item in data[0] if item[0])
            return translated
        except Exception as e:
            print(f"Error on attempt {attempt+1}: {e}")
            time.sleep(2 ** attempt)
    raise Exception("Translation failed after 5 attempts")

def translate_markdown(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if not match:
        print(f"Skipping {file_path}: invalid frontmatter format")
        return

    frontmatter_text = match.group(1)
    body = match.group(2)

    fields = {}
    for line in frontmatter_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        m = re.match(r'^(\w+):\s*"(.*)"$', line)
        if m:
            fields[m.group(1)] = m.group(2)
        else:
            m = re.match(r'^(\w+):\s*(.*)$', line)
            if m:
                fields[m.group(1)] = m.group(2).strip('"')

    keys_to_translate = ['title', 'category', 'year', 'location', 'country', 'source']
    front_list = [f"{i+1}. {fields.get(k, '')}" for i, k in enumerate(keys_to_translate)]
    front_text = "\n".join(front_list)

    print(f"  Translating frontmatter of {os.path.basename(file_path)} to ko...")
    translated_front = translate_text(front_text)
    time.sleep(0.5)

    translated_lines = translated_front.split('\n')
    translated_fields = []
    for line in translated_lines:
        line_str = line.strip()
        if not line_str:
            continue
        m = re.match(r'^\d+[\.、\s]\s*(.*)$', line_str)
        if m:
            translated_fields.append(m.group(1))
        else:
            translated_fields.append(line_str)

    if len(translated_fields) != len(keys_to_translate):
        print(f"  Warning: frontmatter count mismatch (got {len(translated_fields)} of {len(keys_to_translate)}). Translating individually.")
        translated_fields = []
        for k in keys_to_translate:
            val = fields.get(k, '')
            translated_fields.append(translate_text(val) if val else '')
            time.sleep(0.3)

    print(f"  Translating body of {os.path.basename(file_path)} to ko...")
    translated_body = translate_text(body)
    time.sleep(0.5)

    new_fields = fields.copy()
    for idx, k in enumerate(keys_to_translate):
        if idx < len(translated_fields):
            escaped_val = translated_fields[idx].replace('"', '\\"')
            new_fields[k] = escaped_val

    new_fields['language'] = 'ko'

    new_frontmatter = "---\n"
    for k, v in new_fields.items():
        new_frontmatter += f'{k}: "{v}"\n'
    new_frontmatter += "---"

    new_content = f"{new_frontmatter}\n\n{translated_body}\n"

    out_file = file_path.replace('-ja.md', '-ko.md')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"  Saved: {out_file}")

URL_MAP_KO = {
    "https://www.mofa.go.jp/mofaj/area/taisen/kono.html": "https://www.mofa.go.jp/policy/women/fund/state9308.html",
    "https://www.mofa.go.jp/mofaj/a_o/na/kr/page4_001664.html": "https://www.mofa.go.jp/a_o/na/kr/page4e_000364.html",
    "https://www.mofa.go.jp/mofaj/area/taisen/miyazawa.html": "https://www.mofa.go.jp/policy/postwar/state8208.html",
    "https://www.mofa.go.jp/mofaj/press/danwa/07/dmu_0815.html": "https://www.mofa.go.jp/announce/press/pm/murayama/9508.html",
    "https://www.mofa.go.jp/mofaj/area/takeshima/index.html": "https://www.mofa.go.jp/region/asia-paci/takeshima/index.html",
    "https://www.mofa.go.jp/mofaj/area/senkaku/index.html": "https://www.mofa.go.jp/region/asia-paci/senkaku/index.html",
    "https://www.mofa.go.jp/mofaj/area/hoppo/hoppo.html": "https://www.mofa.go.jp/region/europe/russia/territory/index.html",
    "https://www.mofa.go.jp/mofaj/area/hoppo/hoppo_keii.html": "https://www.mofa.go.jp/region/europe/russia/territory/index.html",
    "https://www.mofa.go.jp/mofaj/area/nihonkai_k/index.html": "https://www.mofa.go.jp/policy/maritime/japan/index.html",
    "https://www.mofa.go.jp/mofaj/area/nihonkai_k/keicho.html": "https://www.mofa.go.jp/policy/maritime/japan/index.html",
    "https://www.mofa.go.jp/mofaj/area/nihonkai_k/map/index.html": "https://www.mofa.go.jp/policy/maritime/japan/index.html",
    "https://www.kantei.go.jp/jp/97_abe/discource/20150814danwa.html": "https://japan.kantei.go.jp/97_abe/statement/201508/0814statement.html",
    "https://dokdo.mofa.go.kr/eng/": "https://dokdo.mofa.go.kr/",
}

def translate_notes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    notes = data.get('notes', [])
    if not notes:
        return

    new_notes = []
    for note in notes:
        # Translate each note individually along with its sources
        texts_to_translate = [
            note.get('claim', ''),
            note.get('context', ''),
            note.get('verdict', '')
        ]
        sources = note.get('sources', [])
        for src in sources:
            texts_to_translate.append(src.get('title', ''))
            texts_to_translate.append(src.get('publisher', ''))

        note_list = [f"{i+1}. {txt}" for i, txt in enumerate(texts_to_translate)]
        note_text = "\n".join(note_list)

        print(f"  Translating note {note.get('id')} to ko...")
        translated_note = translate_text(note_text)
        time.sleep(0.5)

        lines = translated_note.split('\n')
        parsed = []
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            m = re.match(r'^\d+[\.、\s]\s*(.*)$', line_str)
            if m:
                parsed.append(m.group(1))
            else:
                parsed.append(line_str)

        expected_len = len(texts_to_translate)
        if len(parsed) != expected_len:
            print(f"  Warning: note count mismatch (got {len(parsed)} instead of {expected_len}). Translating individually.")
            parsed = []
            for txt in texts_to_translate:
                if txt.strip():
                    parsed.append(translate_text(txt))
                else:
                    parsed.append('')
                time.sleep(0.3)

        def get_parsed(idx, default=''):
            if idx < len(parsed):
                return parsed[idx]
            return default

        new_note = note.copy()
        new_note['claim'] = get_parsed(0, note.get('claim', ''))
        new_note['context'] = get_parsed(1, note.get('context', ''))
        new_note['verdict'] = get_parsed(2, note.get('verdict', ''))

        new_sources = []
        for idx, src in enumerate(sources):
            trans_title = get_parsed(3 + idx * 2, src.get('title', ''))
            trans_pub = get_parsed(3 + idx * 2 + 1, src.get('publisher', ''))

            original_url = src.get('url', '')
            mapped_url = URL_MAP_KO.get(original_url)

            if mapped_url:
                new_url = mapped_url
                was_mapped = True
            else:
                new_url = original_url
                was_mapped = False

            parsed_url = urllib.parse.urlparse(new_url)

            is_english_path = any(x in parsed_url.path.lower() for x in ['/policy/', '/region/', '/announce/', '/a_o/', '/en/', '/eng/', '/english/'])
            is_korean_path = any(x in parsed_url.path.lower() for x in ['/ko/', '/kor/', '/korean/'])

            is_foreign_path = is_korean_path or is_english_path

            is_still_japanese_url = (
                'mofaj' in parsed_url.path or
                '/jp/' in parsed_url.path or
                (parsed_url.netloc.endswith('.jp') and not is_foreign_path)
            )

            if is_still_japanese_url and not was_mapped:
                final_title = f"{trans_title} (일본어)"
            else:
                final_title = trans_title

            new_src = src.copy()
            new_src['title'] = final_title
            new_src['publisher'] = trans_pub
            new_src['url'] = new_url
            new_sources.append(new_src)

        new_note['sources'] = new_sources
        new_notes.append(new_note)

    new_data = data.copy()
    new_data['notes'] = new_notes

    out_file = file_path.replace('notes.json', 'notes-ko.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {out_file}")

def main():
    print(f"Starting Korean translation for {len(TARGET_EVENTS)} events...\n")
    for event_id in TARGET_EVENTS:
        event_path = os.path.join(content_dir, event_id)
        if not os.path.exists(event_path):
            print(f"[SKIP] {event_id} — directory not found")
            continue

        print(f"[{event_id}]")
        files = os.listdir(event_path)

        # Translate markdown files
        for file in files:
            if file.endswith('-ja.md'):
                file_path = os.path.join(event_path, file)
                out_path = file_path.replace('-ja.md', '-ko.md')
                if os.path.exists(out_path):
                    print(f"  Skipping (already exists): {file}")
                    continue
                translate_markdown(file_path)
                time.sleep(0.5)

        # Translate notes
        if 'notes.json' in files:
            notes_path = os.path.join(event_path, 'notes.json')
            out_notes = os.path.join(event_path, 'notes-ko.json')
            if os.path.exists(out_notes):
                print(f"  Skipping notes (already exists)")
            else:
                translate_notes(notes_path)
                time.sleep(0.5)

        print()

    print("Korean translation complete!")

if __name__ == '__main__':
    main()
