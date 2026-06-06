const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const eventsDir = path.join(__dirname, '../content/events');
const R2_BUCKET = 'historydiff-photos';
const R2_PUBLIC_URL_BASE = 'https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev';

function getWikimediaFilename(sourceUrl) {
  if (!sourceUrl.includes('commons.wikimedia.org/wiki/File:')) {
    return null;
  }
  const parts = sourceUrl.split('/wiki/File:');
  if (parts.length < 2) return null;
  return decodeURIComponent(parts[1]).replace(/ /g, '_');
}

async function run() {
  const eventFolders = fs.readdirSync(eventsDir);
  console.log(`Found ${eventFolders.length} event folders.`);

  for (const folder of eventFolders) {
    const photosJsonPath = path.join(eventsDir, folder, 'photos.json');
    if (!fs.existsSync(photosJsonPath)) {
      continue;
    }

    console.log(`\nProcessing photos.json for event: ${folder}`);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(photosJsonPath, 'utf8'));
    } catch (e) {
      console.error(`Failed to parse ${photosJsonPath}:`, e.message);
      continue;
    }

    if (!data.photos || !Array.isArray(data.photos)) {
      continue;
    }

    let modified = false;

    for (const photo of data.photos) {
      const filename = getWikimediaFilename(photo.source.url);
      
      if (!filename) {
        console.warn(`  Could not parse filename for photo ${photo.id}. Skipping.`);
        continue;
      }

      console.log(`  Photo ${photo.id}: ${filename}`);

      try {
        // Request optimized 800px width via Special:Filepath redirect
        const downloadUrl = `https://commons.wikimedia.org/wiki/Special:Filepath/${encodeURIComponent(filename)}?width=800`;
        console.log(`    Fetching from Special:Filepath: ${downloadUrl}`);
        
        const response = await fetch(downloadUrl, {
          headers: {
            'User-Agent': 'HistoryDiff/1.0 (https://historydiff.com; contact@historydiff.com) PhotoGalleryMigrator/1.0'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image (HTTP ${response.status})`);
        }

        const contentType = response.headers.get('content-type') || '';
        let ext = 'jpg';
        if (contentType.includes('image/png')) {
          ext = 'png';
        } else if (contentType.includes('image/webp')) {
          ext = 'webp';
        } else if (contentType.includes('image/gif')) {
          ext = 'gif';
        } else if (contentType.includes('image/svg+xml')) {
          ext = 'svg';
        } else {
          // Fallback to URL extension
          const redirectedUrl = response.url;
          const urlMatch = redirectedUrl.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
          if (urlMatch) {
            ext = urlMatch[1].toLowerCase();
          }
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const tempDir = path.join(__dirname, '../tmp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const tempFilePath = path.join(tempDir, `${folder}_${photo.id}.${ext}`);
        fs.writeFileSync(tempFilePath, buffer);

        console.log(`    Downloaded: ${tempFilePath} (${(buffer.length / 1024).toFixed(1)} KB)`);

        // Upload to R2 using --remote
        const r2Key = `events/${folder}/${photo.id}.${ext}`;
        const cmd = `npx wrangler@latest r2 object put "${R2_BUCKET}/${r2Key}" --file "${tempFilePath}" --remote`;
        
        console.log(`    Uploading to R2 (Remote): ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });

        // Update URL to R2 URL
        photo.url = `${R2_PUBLIC_URL_BASE}/${r2Key}`;
        modified = true;
        console.log(`    ✅ Successfully uploaded and updated JSON URL to: ${photo.url}`);

        // Clean up temp file
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error(`  ❌ Failed to migrate photo ${photo.id}:`, err.message);
      }
    }

    if (modified) {
      fs.writeFileSync(photosJsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Saved updated photos.json for ${folder}`);
    }
  }

  console.log('\nMigration run completed.');
}

run().catch(console.error);
