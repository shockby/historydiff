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

def translate_notes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    notes = data.get('notes', [])
    if not notes:
        return

    new_notes = []
    for note in notes:
        note_list = [
            f"1. {note.get('claim', '')}",
            f"2. {note.get('context', '')}",
            f"3. {note.get('verdict', '')}"
        ]
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

        if len(parsed) != 3:
            print(f"  Warning: note count mismatch (got {len(parsed)} instead of 3). Translating individually.")
            parsed = [
                translate_text(note.get('claim', '')),
                translate_text(note.get('context', '')),
                translate_text(note.get('verdict', ''))
            ]
            time.sleep(0.3)

        new_note = note.copy()
        new_note['claim'] = parsed[0] if len(parsed) > 0 else ''
        new_note['context'] = parsed[1] if len(parsed) > 1 else ''
        new_note['verdict'] = parsed[2] if len(parsed) > 2 else ''
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
