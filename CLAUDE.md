@AGENTS.md

# historydiff コンテンツ作成ガイド

## イベントコンテンツの作成手順

新しい歴史的イベント（`content/events/<event-id>/`）を作成する際は、以下の手順・フォーマットに従う。

---

### 1. フォルダ命名規則

```
content/events/<event-id>/
```

- `<event-id>` は英小文字 + ハイフン（例: `kanto-massacre`, `comfort-women`）
- イベントを端的に表す英語スラッグを使用する

---

### 2. 作成すべきファイル一覧

各イベントに対して以下のファイルを作成する（`comfort-women` を参照例とすること）。

#### 国別視点 Markdownファイル（国 × 言語）

登場する「国・地域の視点」ごとに、対応する言語で作成する。

| ファイル名パターン | 内容 |
|---|---|
| `<country>-ja.md` | 日本語テキスト |
| `<country>-en.md` | 英語テキスト |
| `<country>-zh.md` | 中国語（簡体字）テキスト |
| `<country>-ko.md` | 韓国語テキスト |

**使用する国コード例**: `japan`, `korea`, `usa`, `china` など。  
関連する国がある場合のみ追加する（例: 日韓米中が関係する場合は4カ国16ファイル）。

#### Markdownファイルのフロントマター形式

```yaml
---
id: "<event-id>"
title: "<その国・言語における表題>"
category: "<カテゴリ（例: 民族差別・歴史認識問題）>"
year: "<年・時期（例: 1923年9月）>"
location: "<場所>"
country: "<視点の国（例: 日本、韓国、アメリカ合衆国、中国）>"
language: "<言語コード: ja / en / zh / ko>"
source: "<情報源の種別（例: 日本の高校歴史教科書（一般的記述））>"
---
```

フロントマターの後に、その国の教科書・政府見解・学術界の立場を **300〜500文字程度の日本語・英語・中国語・韓国語**で記述する。

---

#### ファクトノート JSONファイル

`notes.json`（日本語）、`notes-en.json`（英語）、`notes-zh.json`（中国語）、`notes-ko.json`（韓国語）の4ファイルを作成する。

```json
{
  "eventId": "<event-id>",
  "notes": [
    {
      "id": "<event-prefix>-<short-name>",
      "claim": "検証対象となる主張・事実（1文）",
      "context": "背景説明・補足（2〜4文）",
      "verdict": "公式記録あり / 歴史的事実 / 推定に幅あり / 議論あり / 事実確認済み など",
      "sources": [
        {
          "title": "出典タイトル",
          "url": "https://...",
          "publisher": "発行元",
          "type": "government / academic / media / archive / ngo / international のいずれか"
        }
      ]
    }
  ]
}
```

- ノート数の目安: **4〜7件**
- 各言語版は同一 `id` を使用し、文章のみ翻訳する

---

#### 写真 JSONファイル（`photos.json`）

```json
{
  "eventId": "<event-id>",
  "photos": [
    {
      "id": "<photo-id>",
      "url": "https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev/events/<event-id>/<filename>",
      "caption": {
        "ja": "日本語キャプション",
        "en": "English caption",
        "zh": "中文说明",
        "ko": "한국어 캡션"
      },
      "source": {
        "title": "Wikimedia Commons",
        "url": "https://commons.wikimedia.org/wiki/File:...",
        "license": "CC BY-SA 4.0 / Public Domain など",
        "author": "撮影者・作者名"
      }
    }
  ]
}
```

**写真の調達・配置手順**:
※ Wikimedia Commons等の外部画像を直接ホットリンク（`upload.wikimedia.org`）して使用すると、リファラー制限やHTTP 400エラー等で読み込めないため、必ずCloudflare R2（CDN）にコピーするか、ローカルに配置して使用すること。
1. `https://commons.wikimedia.org/wiki/Category:<EventName>` でカテゴリを検索する
2. 個別ファイルページでライセンス（`CC BY-SA 4.0` または `Public Domain` を優先）と作者名を確認する
3. 画像ファイルをダウンロードする（例: `wget` 等を利用）
4. ダウンロードした画像を配置する。方法として以下のいずれかを選択する：
   - **R2 CDN方式**: Cloudflare R2バケット（`historydiff-photos`）の `events/<event-id>/` 配下にアップロードする
   - **ローカル配置方式 (推奨/代替)**: AIエージェントなどR2へのアップロード権限がない場合やR2の画像が破損している場合は、ローカルの `public/images/events/<event-id>/` ディレクトリ配下に保存する。
5. `photos.json` の `url` フィールドには、画像のパスを指定する：
   - R2 CDN方式: `https://pub-c2a7c565ec0844b8b93c4ba4006e5b52.r2.dev/events/<event-id>/<filename>`
   - ローカル配置方式: `/images/events/<event-id>/<filename>`
6. ローカルサーバーを起動するか、ビルドを実行して画像が正常に表示されるか確認する

---

### 3. コンテンツ記述のガイドライン

- **各国の立場を中立的に**記述する（事実認定・否定・議論中の状態を明示）
- **数値・固有名詞**は太字（`**6,000人以上**` 等）で強調する
- **教科書・政府・学術界**の3レイヤーで立場を整理する
- 政府の公式立場と学術界の見解が乖離している場合はその差異を明示する
- 2023年など**近年の動向**も含める

#### 3.1. 構文エラー（SyntaxError）の防止と検証
JSONやMarkdownのフロントマターを記述・翻訳する際は、構文エラーを防ぐために以下を徹底すること。

- **JSON内のダブルクォーテーションのエスケープ**:
  - `photos.json` や `notes-*.json` 内の文字列中にダブルクォーテーションが含まれる場合は、必ず `\"` のようにエスケープする。（例：`"高宗推行\"光武改革\"謀求..."`）
  - エスケープ漏れがあると、ビルド時やページロード時に `SyntaxError: Expected ',' or '}' after property value in JSON` が発生する。
- **YAMLフロントマターのエスケープ**:
  - Markdownファイル上部のYAMLフロントマターの文字列フィールド内にダブルクォーテーションが含まれる場合は、エスケープするか、シングルクォーテーションで囲む。
- **自動翻訳実行後の確認**:
  - 翻訳スクリプト（`translate.py`, `translate_ko.py`）等でテキストを機械翻訳した場合、出力されたテキスト内でクォーテーションの文字種（`"` や `”` 等）が変わったり、エスケープが外れたりすることがあるため、実行後は必ず差分と構文を確認する。
- **構文検証コマンド**:
  - 作成・編集後は、以下のコマンドを実行してJSONに文法エラーがないか確認すること：
    ```bash
    rtk python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('content/events/*/*.json')]"
    ```
  - アプリケーション全体のビルド確認：
    ```bash
    rtk npm run build
    ```

---

### 4. 参照例

既存イベントを参照テンプレートとして使用すること:

- `content/events/comfort-women/` — 日韓中 + 米の4カ国、韓国語版あり
- `content/events/nanjing-massacre/` — 日中 + 米の3カ国、韓国語版なし

新規イベントに関係する国・言語の組み合わせは事案に応じて判断する。
