import os
import glob

try:
    from PIL import Image, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("⚠️ Pillow (PIL) is not installed. Skipping OGP image generation (using existing public/og assets).")

FONT_BOLD_PATH = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FONT_REGULAR_PATH = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'

COUNTRY_FLAGS = {
    '日本': '🇯🇵', 'Japan': '🇯🇵', '일본': '🇯🇵',
    '中国': '🇨🇳', 'China': '🇨🇳', '중국': '🇨🇳',
    'アメリカ合衆国': '🇺🇸', 'United States': '🇺🇸', '美国': '🇺🇸', '미국': '🇺🇸', 'USA': '🇺🇸',
    '韓国': '🇰🇷', 'South Korea': '🇰🇷', 'Korea': '🇰🇷', '한국': '🇰🇷',
    '台湾': '🇹🇼', 'Taiwan': '🇹🇼', '대만': '🇹🇼',
    'ロシア': '🇷🇺', 'Russia': '🇷🇺', '俄罗斯': '🇷🇺', '러시아': '🇷🇺',
    'ウクライナ': '🇺🇦', 'Ukraine': '🇺🇦', '乌克兰': '乌克兰', '우크라이나': '🇺🇦',
    'イギリス': '🇬🇧', 'United Kingdom': '🇬🇧', '英国': '🇬🇧', '영국': '🇬🇧',
    'アルゼンチン': '🇦🇷', 'Argentina': '🇦🇷', '阿根廷': '🇦🇷', '아르헨티나': '🇦🇷',
    'ドイツ': '🇩🇪', 'Germany': '🇩🇪', '德国': '🇩🇪', '독일': '🇩🇪',
    'フランス': '🇫🇷', 'France': '🇫🇷', '法国': '🇫🇷', '프랑스': '🇫🇷',
    'イスラエル': '🇮🇱', 'Israel': '🇮🇱', '以色​​列': '🇮🇱', '이스라엘': '🇮🇱',
    'パレスチナ': '🇵🇸', 'Palestine': '🇵🇸', '巴勒斯坦': '🇵🇸', '팔레스타인': '🇵🇸',
    'イラン': '🇮🇷', 'Iran': '🇮🇷', '伊朗': '🇮🇷', '이란': '🇮🇷',
    'スーダン': '🇸🇩', 'Sudan': '🇸🇩', '苏丹': '🇸🇩', '수단': '🇸🇩',
    'ミャンマー': '🇲🇲', 'Myanmar': '🇲🇲', '缅甸': '🇲🇲', '미얀마': '🇲🇲',
    'タリバン': '🇦🇫', 'Taliban': '🇦🇫', '塔利班': '🇦🇫', '탈레반': '🇦🇫',
}

TAGLINES = {
    'ja': '歴史の「記述の差」を、視覚的に解明する。',
    'en': 'Visually unravelling the "differences in descriptions" of history.',
    'zh': '直观阐明历史教科书的“记述之差”。',
    'ko': '역사의 "기술 차이"를 시각적으로 밝힌다.',
}

DIFF_LABELS = {
    'ja': '● 各国の歴史教科書テキスト差分（Diff）を直接比較',
    'en': '● Direct text comparison (Diff) across national history textbooks',
    'zh': '● 直接比对各国历史教科书文本差异（Diff）',
    'ko': '● 각국 역사 교과서 텍스트 차이점(Diff) 직접 비교',
}

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def parse_frontmatter(file_path):
    metadata = {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                for line in parts[1].strip().split('\n'):
                    if ':' in line:
                        k, v = line.split(':', 1)
                        metadata[k.strip()] = v.strip().strip('"\'')
    except Exception as e:
        pass
    return metadata

def wrap_text(text, font, max_width, draw):
    lines = []
    curr_line = ""
    for char in list(text):
        test_line = curr_line + char
        bbox = draw.textbbox((0, 0), test_line, font=font)
        w = bbox[2] - bbox[0]
        if w > max_width and curr_line:
            lines.append(curr_line)
            curr_line = char
        else:
            curr_line = test_line
    if curr_line:
        lines.append(curr_line)
    return lines

def create_og_image(output_path, title, category, year, countries, lang='ja'):
    width, height = 1200, 630
    img = Image.new('RGB', (width, height), color=(10, 10, 14))
    draw = ImageDraw.Draw(img)

    # Ambient radial glows
    for r in range(350, 0, -25):
        draw.ellipse([width - 450 - r, 30 - r, width - 450 + r, 30 + r], fill=(224, 46, 46))
        draw.ellipse([100 - r, height - 100 - r, 100 + r, height - 100 + r], fill=(139, 92, 246))

    # Dark overlay to keep text sharp
    overlay = Image.new('RGBA', (width, height), (10, 10, 14, 230))
    img.paste(overlay, (0, 0), overlay)
    draw = ImageDraw.Draw(img)

    # Outer border
    draw.rounded_rectangle([24, 24, width - 24, height - 24], radius=20, outline=(255, 255, 255, 30), width=2)
    # Inner accent line
    draw.line([50, 24, width - 50, 24], fill=(224, 46, 46), width=3)

    # Header Logo
    font_logo_bold = get_font(FONT_BOLD_PATH, 42)
    font_sub = get_font(FONT_BOLD_PATH, 16)
    draw.text((70, 60), "History", font=font_logo_bold, fill=(224, 46, 46))
    bbox_h = draw.textbbox((70, 60), "History", font=font_logo_bold)
    draw.text((bbox_h[2], 60), "Diff", font=font_logo_bold, fill=(240, 240, 245))

    # Header Badge: TEXTBOOK DIFF ARCHIVE
    draw.rounded_rectangle([width - 390, 65, width - 70, 105], radius=10, fill=(255, 255, 255, 15), outline=(255, 255, 255, 40))
    draw.text((width - 370, 74), "TEXTBOOK DIFF ARCHIVE", font=font_sub, fill=(200, 200, 215))

    # Event Tags (Year, Category)
    tags_y = 150
    curr_x = 70
    font_tag = get_font(FONT_BOLD_PATH, 18)
    
    if year:
        bbox = draw.textbbox((0, 0), year, font=font_tag)
        tw = bbox[2] - bbox[0] + 28
        draw.rounded_rectangle([curr_x, tags_y, curr_x + tw, tags_y + 36], radius=8, fill=(224, 46, 46, 40), outline=(224, 46, 46, 120))
        draw.text((curr_x + 14, tags_y + 6), year, font=font_tag, fill=(255, 120, 120))
        curr_x += tw + 14

    if category:
        bbox = draw.textbbox((0, 0), category, font=font_tag)
        tw = bbox[2] - bbox[0] + 28
        draw.rounded_rectangle([curr_x, tags_y, curr_x + tw, tags_y + 36], radius=8, fill=(255, 255, 255, 20), outline=(255, 255, 255, 50))
        draw.text((curr_x + 14, tags_y + 6), category, font=font_tag, fill=(220, 220, 230))

    # Event Title
    font_title = get_font(FONT_BOLD_PATH, 44 if len(title) < 30 else 36)
    title_lines = wrap_text(title, font_title, width - 140, draw)
    title_y = 210
    for idx, line in enumerate(title_lines[:2]):
        draw.text((70, title_y + idx * 56), line, font=font_title, fill=(255, 255, 255))

    # Countries pill comparison bar
    countries_y = 345 if len(title_lines) <= 1 else 370
    country_font = get_font(FONT_BOLD_PATH, 20)
    vs_font = get_font(FONT_BOLD_PATH, 16)
    cx = 70
    for idx, c in enumerate(countries[:4]):
        flag = COUNTRY_FLAGS.get(c, '🏳️')
        label = f"{flag} {c}"
        bbox = draw.textbbox((0, 0), label, font=country_font)
        cw = bbox[2] - bbox[0] + 32
        
        draw.rounded_rectangle([cx, countries_y, cx + cw, countries_y + 44], radius=22, fill=(255, 255, 255, 20), outline=(255, 255, 255, 50))
        draw.text((cx + 16, countries_y + 8), label, font=country_font, fill=(245, 245, 250))
        cx += cw + 12

        if idx < len(countries[:4]) - 1:
            draw.text((cx + 2, countries_y + 12), "vs", font=vs_font, fill=(224, 46, 46))
            cx += 36

    # Highlight Diff Visual Box (Bottom section)
    diff_box_y = 440
    diff_box_h = 100
    draw.rounded_rectangle([70, diff_box_y, width - 70, diff_box_y + diff_box_h], radius=14, fill=(18, 18, 24, 200), outline=(255, 255, 255, 30))
    
    diff_text_font = get_font(FONT_REGULAR_PATH, 20)
    diff_label = DIFF_LABELS.get(lang, DIFF_LABELS['en'])
    draw.text((95, diff_box_y + 20), diff_label, font=diff_text_font, fill=(160, 160, 175))

    font_mini = get_font(FONT_BOLD_PATH, 16)
    draw.text((95, diff_box_y + 58), "[- Red: Deletions/Differences]", font=font_mini, fill=(248, 113, 113))
    draw.text((390, diff_box_y + 58), "[+ Green: Additions/Differences]", font=font_mini, fill=(74, 222, 128))

    # Footer tagline & domain
    font_footer = get_font(FONT_REGULAR_PATH, 16)
    tagline = TAGLINES.get(lang, TAGLINES['en'])
    draw.text((70, 565), tagline, font=font_footer, fill=(140, 140, 155))
    draw.text((width - 320, 565), "https://historydiff.pages.dev", font=font_footer, fill=(180, 180, 195))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", optimize=True)

def main():
    if not HAS_PIL:
        return

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    events_dir = os.path.join(base_dir, 'content', 'events')
    out_og_dir = os.path.join(base_dir, 'public', 'og')
    os.makedirs(out_og_dir, exist_ok=True)

    languages = ['ja', 'en', 'zh', 'ko']

    # 1. Generate Top page OGP images
    top_titles = {
        'ja': '歴史の「記述の差」を、視覚的に解明する。',
        'en': 'Visually unravelling the "differences in descriptions" of history.',
        'zh': '直观阐明历史“记述之差”的对比平台。',
        'ko': '역사의 "기술 차이"를 시각적으로 밝히는 비교 플랫폼.',
    }
    top_categories = {
        'ja': '多角比較アーカイブ',
        'en': 'Multi-Perspective Archive',
        'zh': '多国视角对比档案',
        'ko': '다각적 비교 아카이브',
    }

    for lang in languages:
        top_img_path = os.path.join(out_og_dir, f'og-top-{lang}.png')
        create_og_image(
            top_img_path,
            title=top_titles[lang],
            category=top_categories[lang],
            year='1885-2026',
            countries=['日本', '中国', 'アメリカ合衆国', '韓国'] if lang == 'ja' else ['Japan', 'China', 'USA', 'Korea'],
            lang=lang
        )

    # 2. Generate Event OGP images
    event_folders = sorted(os.listdir(events_dir))
    count = 0
    for event_id in event_folders:
        event_path = os.path.join(events_dir, event_id)
        if not os.path.isdir(event_path):
            continue

        for lang in languages:
            md_files = glob.glob(os.path.join(event_path, f'*-{lang}.md'))
            if not md_files:
                md_files = glob.glob(os.path.join(event_path, '*-ja.md')) or glob.glob(os.path.join(event_path, '*-en.md'))

            if not md_files:
                continue

            first_meta = parse_frontmatter(md_files[0])
            title = first_meta.get('title', event_id.replace('-', ' ').title())
            category = first_meta.get('category', 'History')
            year = first_meta.get('year', '')

            countries = []
            for mf in md_files:
                meta = parse_frontmatter(mf)
                c = meta.get('country', '')
                if c and c not in countries:
                    countries.append(c)

            out_img = os.path.join(out_og_dir, 'events', f'{event_id}-{lang}.png')
            create_og_image(out_img, title, category, year, countries, lang=lang)
            count += 1

    print(f"✅ Generated {count} event OGP images + 4 top OGP images into public/og/")

if __name__ == '__main__':
    main()
