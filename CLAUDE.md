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
      "url": "https://upload.wikimedia.org/wikipedia/commons/...",
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

**写真の調達手順**:
1. `https://commons.wikimedia.org/wiki/Category:<EventName>` でカテゴリを検索する
2. 個別ファイルページで直接URLと license / author を確認する
3. `curl -s -o /dev/null -w "%{http_code}"` でURLの存在確認（200であること）
4. ライセンスは `CC BY-SA 4.0`（要帰属）または `Public Domain` を優先する
5. URLは `https://upload.wikimedia.org/wikipedia/commons/<hash>/<FileName>` の形式を使用する

---

### 3. コンテンツ記述のガイドライン

- **各国の立場を中立的に**記述する（事実認定・否定・議論中の状態を明示）
- **数値・固有名詞**は太字（`**6,000人以上**` 等）で強調する
- **教科書・政府・学術界**の3レイヤーで立場を整理する
- 政府の公式立場と学術界の見解が乖離している場合はその差異を明示する
- 2023年など**近年の動向**も含める

---

### 4. 参照例

既存イベントを参照テンプレートとして使用すること:

- `content/events/comfort-women/` — 日韓中 + 米の4カ国、韓国語版あり
- `content/events/nanjing-massacre/` — 日中 + 米の3カ国、韓国語版なし

新規イベントに関係する国・言語の組み合わせは事案に応じて判断する。
