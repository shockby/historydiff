#!/bin/bash
# Upload photos to Cloudflare R2 bucket: historydiff-photos
# Usage: bash upload_photos.sh

BUCKET="historydiff-photos"
WRANGLER="npx wrangler@latest"
TMP_DIR="/tmp/historydiff-photos"

mkdir -p "$TMP_DIR"

upload_image() {
  local event_id="$1"
  local photo_id="$2"
  local url="$3"
  local ext="${url##*.}"
  # Normalize extension
  case "$ext" in
    jpg|JPG|jpeg|JPEG) ext="jpg" ;;
    png|PNG) ext="png" ;;
    *) ext="jpg" ;;
  esac

  local local_file="$TMP_DIR/${event_id}_${photo_id}.${ext}"
  local r2_key="events/${event_id}/${photo_id}.${ext}"

  echo "⬇️  Downloading: $photo_id for $event_id"
  curl -L --user-agent "HistoryDiff/1.0 (https://historydiff.app; photo archiving)" \
    -o "$local_file" "$url" --silent --show-error

  if [ $? -eq 0 ] && [ -s "$local_file" ]; then
    echo "⬆️  Uploading to R2: $r2_key"
    $WRANGLER r2 object put "$BUCKET/$r2_key" --file "$local_file" 2>&1
    echo "✅ Done: $r2_key"
  else
    echo "❌ Download failed: $url"
  fi
}

# ===== senkaku / 尖閣諸島 =====
upload_image "senkaku" "senkaku-islands-satellite" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Senkaku_Islands_by_NASA.jpg/1280px-Senkaku_Islands_by_NASA.jpg"

upload_image "senkaku" "uotsuri-island-aerial" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Uotsuri-jima_aerial_2011.jpg/1280px-Uotsuri-jima_aerial_2011.jpg"

# ===== takeshima / 竹島・独島 =====
upload_image "takeshima" "dokdo-aerial" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Liancourt_Rocks_aerial.jpg/1280px-Liancourt_Rocks_aerial.jpg"

upload_image "takeshima" "dokdo-coast-guard" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Dokdo_from_a_South_Korean_coastguard_vessel.jpg/1280px-Dokdo_from_a_South_Korean_coastguard_vessel.jpg"

# ===== northern-territories / 北方領土 =====
upload_image "northern-territories" "etorofu-island" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Iturup_ISS013-E-24184.jpg/1280px-Iturup_ISS013-E-24184.jpg"

# ===== sino-japanese-war / 日清戦争 =====
upload_image "sino-japanese-war" "battle-of-yalu-1894" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Battle_of_Yalu_River_1894.jpg/1280px-Battle_of_Yalu_River_1894.jpg"

upload_image "sino-japanese-war" "treaty-of-shimonoseki" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Treaty_of_Shimonoseki1.jpg/1280px-Treaty_of_Shimonoseki1.jpg"

# ===== pacific-war-end / 太平洋戦争終戦 =====
upload_image "pacific-war-end" "surrender-ceremony-1945" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Surrender-of-Japan-USS-Missouri.jpg/1280px-Surrender-of-Japan-USS-Missouri.jpg"

upload_image "pacific-war-end" "gyokuon-hoso" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Hirohito_in_dress_uniform.jpg/800px-Hirohito_in_dress_uniform.jpg"

# ===== siberian-internment / シベリア抑留 =====
upload_image "siberian-internment" "pows-siberia" \
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Japanese_prisoners_of_war_in_Siberia.jpg/1280px-Japanese_prisoners_of_war_in_Siberia.jpg"

echo ""
echo "🎉 All uploads complete!"
echo "Public URL base: https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev"
