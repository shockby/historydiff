import os
import re
import urllib.request
import urllib.parse
import json
import time

CONTENT_DIR = 'content/events'

URL_MAP = {
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
    "https://www8.cao.go.jp/hoppo/": "https://www8.cao.go.jp/hoppo/en/index.html",
    "https://www8.cao.go.jp/hoppo/mondai/01.html": "https://www8.cao.go.jp/hoppo/en/index.html",
    "https://dokdo.mofa.go.kr/eng/": "https://dokdo.mofa.go.kr/",
}

def translate_text(text, target_lang):
    if not text or not text.strip():
        return text
    # Google translate target language code
    tl = 'zh-CN' if target_lang == 'zh' else target_lang
    for attempt in range(5):
        try:
            q = urllib.parse.quote(text)
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl={tl}&dt=t&q={q}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req, timeout=15)
            data = json.loads(res.read().decode('utf-8'))
            translated = "".join(item[0] for item in data[0] if item and item[0])
            return translated
        except Exception as e:
            time.sleep(1 + attempt)
    return text

def translate_markdown(file_path, target_lang):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if not match:
        print(f"Skipping {file_path}: invalid frontmatter")
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

    translated_front = translate_text(front_text, target_lang)
    time.sleep(0.15)

    translated_lines = translated_front.split('\n')
    translated_fields = []
    for line in translated_lines:
        line_str = line.strip()
        if not line_str:
            continue
        m = re.match(r'^[0-9一二三四五六七八九十]+[\.、\s]\s*(.*)$', line_str)
        if m:
            translated_fields.append(m.group(1))
        else:
            translated_fields.append(line_str)

    if len(translated_fields) != len(keys_to_translate):
        translated_fields = []
        for k in keys_to_translate:
            val = fields.get(k, '')
            translated_fields.append(translate_text(val, target_lang) if val else '')
            time.sleep(0.1)

    translated_body = translate_text(body, target_lang)
    time.sleep(0.15)

    new_fields = fields.copy()
    for idx, k in enumerate(keys_to_translate):
        if idx < len(translated_fields):
            escaped_val = translated_fields[idx].replace('"', '\\"')
            new_fields[k] = escaped_val

    new_fields['language'] = target_lang

    new_frontmatter = "---\n"
    for k, v in new_fields.items():
        new_frontmatter += f'{k}: "{v}"\n'
    new_frontmatter += "---"

    new_content = f"{new_frontmatter}\n\n{translated_body}\n"

    out_file = file_path.replace('-ja.md', f'-{target_lang}.md')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Saved MD: {out_file}")

def translate_notes(file_path, target_lang):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    notes = data.get('notes', [])
    if not notes:
        return

    new_notes = []
    for note in notes:
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

        translated_note = translate_text(note_text, target_lang)
        time.sleep(0.15)

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
            parsed = []
            for txt in texts_to_translate:
                if txt.strip():
                    parsed.append(translate_text(txt, target_lang))
                else:
                    parsed.append('')
                time.sleep(0.1)

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
            mapped_url = URL_MAP.get(original_url)

            if mapped_url:
                new_url = mapped_url
                was_mapped = True
            else:
                new_url = original_url
                was_mapped = False

            parsed_url = urllib.parse.urlparse(new_url)
            is_english_path = any(x in parsed_url.path.lower() for x in ['/policy/', '/region/', '/announce/', '/a_o/', '/en/', '/eng/', '/english/'])
            is_chinese_path = any(x in parsed_url.path.lower() for x in ['/zh/', '/chi/', '/chinese/'])
            is_korean_path = any(x in parsed_url.path.lower() for x in ['/ko/', '/kor/', '/korean/'])

            is_foreign_path = False
            if target_lang == 'zh':
                is_foreign_path = is_chinese_path or is_english_path
            elif target_lang == 'ko':
                is_foreign_path = is_korean_path or is_english_path

            is_still_japanese_url = (
                'mofaj' in parsed_url.path or
                '/jp/' in parsed_url.path or
                (parsed_url.netloc.endswith('.jp') and not is_foreign_path)
            )

            if is_still_japanese_url and not was_mapped:
                if target_lang == 'zh':
                    final_title = f"{trans_title} (日语)"
                elif target_lang == 'ko':
                    final_title = f"{trans_title} (일본어)"
                else:
                    final_title = trans_title
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

    out_file = file_path.replace('notes.json', f'notes-{target_lang}.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"Saved notes: {out_file}")

def update_event_json(event_dir):
    event_file = os.path.join(event_dir, 'event.json')
    if not os.path.exists(event_file):
        return
    with open(event_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    title = data.get('title', {})
    changed = False
    for lang in ['zh', 'ko']:
        if lang not in title:
            base_title = title.get('ja') or title.get('en', '')
            trans = translate_text(base_title, lang)
            title[lang] = trans
            changed = True
            time.sleep(0.1)
    if changed:
        data['title'] = title
        with open(event_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated event.json: {event_file}")

def update_voices_json(event_dir):
    voices_file = os.path.join(event_dir, 'voices.json')
    if not os.path.exists(voices_file):
        return
    with open(voices_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    changed = False
    disclaimer = data.get('disclaimer', {})
    for lang in ['zh', 'ko']:
        if lang not in disclaimer:
            base = disclaimer.get('ja') or disclaimer.get('en', '')
            if base:
                disclaimer[lang] = translate_text(base, lang)
                changed = True
                time.sleep(0.1)
    data['disclaimer'] = disclaimer

    for voice in data.get('voices', []):
        for field in ['country', 'summary', 'context']:
            obj = voice.get(field, {})
            if isinstance(obj, dict):
                for lang in ['zh', 'ko']:
                    if lang not in obj:
                        base = obj.get('ja') or obj.get('en', '')
                        if base:
                            obj[lang] = translate_text(base, lang)
                            changed = True
                            time.sleep(0.1)
                voice[field] = obj

    if changed:
        with open(voices_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Updated voices.json: {voices_file}")

def process_event(event_dir):
    files = set(os.listdir(event_dir))
    # 1. event.json
    update_event_json(event_dir)
    # 2. voices.json
    update_voices_json(event_dir)
    # 3. notes.json
    if 'notes.json' in files:
        notes_path = os.path.join(event_dir, 'notes.json')
        if 'notes-zh.json' not in files:
            translate_notes(notes_path, 'zh')
        if 'notes-ko.json' not in files:
            translate_notes(notes_path, 'ko')
    # 4. markdown files
    ja_mds = [f for f in sorted(files) if f.endswith('-ja.md')]
    for jf in ja_mds:
        base = jf[:-6]
        jf_path = os.path.join(event_dir, jf)
        if f'{base}-zh.md' not in files:
            translate_markdown(jf_path, 'zh')
        if f'{base}-ko.md' not in files:
            translate_markdown(jf_path, 'ko')

def main():
    events = sorted(os.listdir(CONTENT_DIR))
    print(f"Starting translation scan for {len(events)} events...")
    for ev in events:
        p = os.path.join(CONTENT_DIR, ev)
        if os.path.isdir(p):
            process_event(p)
    print("Done!")

if __name__ == '__main__':
    main()
