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

URL_MAP_EN = {
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
}

URL_MAP_ZH = URL_MAP_EN.copy()

def get_url_map(target_lang):
    lang = 'en'
    if 'zh' in target_lang:
        lang = 'zh'
    elif 'ko' in target_lang:
        lang = 'ko'
        
    if lang == 'en':
        return URL_MAP_EN
    elif lang == 'zh':
        return URL_MAP_ZH
    return {}

def translate_notes(file_path, target_lang):
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
                
        expected_len = len(texts_to_translate)
        if len(parsed) != expected_len:
            print(f"Warning: parsed count mismatch (got {len(parsed)} instead of {expected_len}). Translating individually.")
            parsed = []
            for txt in texts_to_translate:
                if txt.strip():
                    parsed.append(translate_text(txt, target_lang))
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
            url_map = get_url_map(target_lang)
            mapped_url = url_map.get(original_url)
            
            if mapped_url:
                new_url = mapped_url
                was_mapped = True
            else:
                new_url = original_url
                was_mapped = False
                
            parsed_url = urllib.parse.urlparse(new_url)
            is_still_japanese_url = (
                'mofaj' in parsed_url.path or
                '/jp/' in parsed_url.path or
                parsed_url.netloc.endswith('.jp')
            )
            
            if is_still_japanese_url and not was_mapped:
                if target_lang == 'en':
                    final_title = f"{trans_title} (in Japanese)"
                elif 'zh' in target_lang:
                    final_title = f"{trans_title} (日语)"
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
