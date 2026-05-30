import os
import re
import urllib.request
import urllib.parse
import json
import time

content_dir = 'content/events'

def translate_text(text, target_lang):
    if not text.strip():
        return text
    # Retry logic up to 5 attempts with exponential backoff
    for attempt in range(5):
        try:
            q = urllib.parse.quote(text)
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl={target_lang}&dt=t&q={q}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            res = urllib.request.urlopen(req)
            data = json.loads(res.read().decode('utf-8'))
            translated = "".join(item[0] for item in data[0] if item[0])
            return translated
        except Exception as e:
            print(f"Error on attempt {attempt+1} for lang {target_lang}: {e}")
            time.sleep(2 ** attempt)
    raise Exception("Translation failed after 5 attempts")

def translate_markdown(file_path, target_lang):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse YAML frontmatter
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', content, re.DOTALL)
    if not match:
        print(f"Skipping {file_path}: invalid frontmatter format")
        return
        
    frontmatter_text = match.group(1)
    body = match.group(2)
    
    # Parse frontmatter fields
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

    # Frontmatter batch translation using numbered list (extremely robust)
    keys_to_translate = ['title', 'category', 'year', 'location', 'country', 'source']
    front_list = [f"{i+1}. {fields.get(k, '')}" for i, k in enumerate(keys_to_translate)]
    front_text = "\n".join(front_list)
    
    print(f"Translating frontmatter of {file_path} to {target_lang}...")
    translated_front = translate_text(front_text, target_lang)
    time.sleep(0.3)
    
    # Parse frontmatter back
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
            
    # Fallback to individual translations if parsing failed
    if len(translated_fields) != len(keys_to_translate):
        print(f"Warning: parsed frontmatter count mismatch (got {len(translated_fields)} of {len(keys_to_translate)}). Translating individually.")
        translated_fields = []
        for k in keys_to_translate:
            val = fields.get(k, '')
            translated_fields.append(translate_text(val, target_lang) if val else '')
            time.sleep(0.3)
            
    # Translate body
    print(f"Translating body of {file_path} to {target_lang}...")
    translated_body = translate_text(body, target_lang)
    time.sleep(0.3)
    
    # Reconstruct fields
    new_fields = fields.copy()
    for idx, k in enumerate(keys_to_translate):
        if idx < len(translated_fields):
            escaped_val = translated_fields[idx].replace('"', '\\"')
            new_fields[k] = escaped_val
        
    new_fields['language'] = 'en' if target_lang == 'en' else 'zh'
    
    # Generate new frontmatter text
    new_frontmatter = "---\n"
    for k, v in new_fields.items():
        new_frontmatter += f'{k}: "{v}"\n'
    new_frontmatter += "---"
    
    new_content = f"{new_frontmatter}\n\n{translated_body}\n"
    
    # Output path
    out_lang = 'en' if target_lang == 'en' else 'zh'
    out_file = file_path.replace('-ja.md', f'-{out_lang}.md')
    with open(out_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Saved: {out_file}")

def translate_notes(file_path, target_lang):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    notes = data.get('notes', [])
    if not notes:
        return
        
    new_notes = []
    for note in notes:
        # Translate each note individually using a 3-item numbered list (handles long text safely)
        note_list = [
            f"1. {note.get('claim', '')}",
            f"2. {note.get('context', '')}",
            f"3. {note.get('verdict', '')}"
        ]
        note_text = "\n".join(note_list)
        
        print(f"Translating note {note.get('id')} to {target_lang}...")
        translated_note = translate_text(note_text, target_lang)
        time.sleep(0.3)
        
        # Parse lines
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
                
        # Fallback to individual
        if len(parsed) != 3:
            print(f"Warning: parsed note count mismatch (got {len(parsed)} instead of 3). Translating fields individually.")
            parsed = [
                translate_text(note.get('claim', ''), target_lang),
                translate_text(note.get('context', ''), target_lang),
                translate_text(note.get('verdict', ''), target_lang)
            ]
            time.sleep(0.3)
            
        new_note = note.copy()
        new_note['claim'] = parsed[0] if len(parsed) > 0 else ''
        new_note['context'] = parsed[1] if len(parsed) > 1 else ''
        new_note['verdict'] = parsed[2] if len(parsed) > 2 else ''
        new_notes.append(new_note)
        
    new_data = data.copy()
    new_data['notes'] = new_notes
    
    suffix = 'en' if target_lang == 'en' else 'zh'
    out_file = file_path.replace('notes.json', f'notes-{suffix}.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    print(f"Saved: {out_file}")

def main():
    print("Starting robust content translation...")
    for root, dirs, files in os.walk(content_dir):
        for file in files:
            if file.endswith('-ja.md'):
                file_path = os.path.join(root, file)
                # Translate to en and zh-CN
                translate_markdown(file_path, 'en')
                time.sleep(0.3)
                translate_markdown(file_path, 'zh-CN')
                time.sleep(0.3)
            elif file == 'notes.json':
                file_path = os.path.join(root, file)
                translate_notes(file_path, 'en')
                time.sleep(0.3)
                translate_notes(file_path, 'zh-CN')
                time.sleep(0.3)
    print("Content translation complete!")

if __name__ == '__main__':
    main()
