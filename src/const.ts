export const LANGUAGES: [string, string][] = [
  ['日本語 (Japanese)', 'ja'],
  ['英語 (English)', 'en'],
  ['中国語 (Chinese)', 'zh'],
  ['広東語 (Cantonese)', 'yue'],
  ['韓国語 (Korean)', 'ko'],
  ['ドイツ語 (German)', 'de'],
  ['スペイン語 (Spanish)', 'es'],
  ['ロシア語 (Russian)', 'ru'],
  ['フランス語 (French)', 'fr'],
  ['ポルトガル語 (Portuguese)', 'pt'],
  ['トルコ語 (Turkish)', 'tr'],
  ['ポーランド語 (Polish)', 'pl'],
  ['カタルーニャ語 (Catalan)', 'ca'],
  ['オランダ語 (Dutch)', 'nl'],
  ['アラビア語 (Arabic)', 'ar'],
  ['スウェーデン語 (Swedish)', 'sv'],
  ['イタリア語 (Italian)', 'it'],
  ['インドネシア語 (Indonesian)', 'id'],
  ['ヒンディー語 (Hindi)', 'hi'],
  ['フィンランド語 (Finnish)', 'fi'],
  ['ベトナム語 (Vietnamese)', 'vi'],
  ['ヘブライ語 (Hebrew)', 'he'],
  ['ウクライナ語 (Ukrainian)', 'uk'],
  ['ギリシア語 (Greek)', 'el'],
  ['マレー語 (Malay)', 'ms'],
  ['チェコ語 (Czech)', 'cs'],
  ['ルーマニア語 (Romanian)', 'ro'],
  ['デンマーク語 (Danish)', 'da'],
  ['ハンガリー語 (Hungarian)', 'hu'],
  ['タミル語 (Tamil)', 'ta'],
  ['ノルウェー語 (Norwegian)', 'no'],
  ['タイ語 (Thai)', 'th'],
  ['ウルドゥー語 (Urdu)', 'ur'],
  ['クロアチア語 (Croatian)', 'hr'],
  ['ブルガリア語 (Bulgarian)', 'bg'],
  ['リトアニア語 (Lithuanian)', 'lt'],
  ['ラテン語 (Latin)', 'la'],
  ['マオリ語 (Maori)', 'mi'],
  ['マラヤーラム語 (Malayalam)', 'ml'],
  ['ウェールズ語 (Welsh)', 'cy'],
  ['スロバキア語 (Slovak)', 'sk'],
  ['テルグ語 (Telugu)', 'te'],
  ['ペルシア語 (Persian)', 'fa'],
  ['ラトビア語 (Latvian)', 'lv'],
  ['ベンガル語 (Bengali)', 'bn'],
  ['セルビア語 (Serbian)', 'sr'],
  ['アゼルバイジャン語 (Azerbaijani)', 'az'],
  ['スロベニア語 (Slovenian)', 'sl'],
  ['カンナダ語 (Kannada)', 'kn'],
  ['エストニア語 (Estonian)', 'et'],
  ['マケドニア語 (Macedonian)', 'mk'],
  ['ブルトン語 (Breton)', 'br'],
  ['バスク語 (Basque)', 'eu'],
  ['アイスランド語 (Icelandic)', 'is'],
  ['アルメニア語 (Armenian)', 'hy'],
  ['ネパール語 (Nepali)', 'ne'],
  ['モンゴル語 (Mongolian)', 'mn'],
  ['ボスニア語 (Bosnian)', 'bs'],
  ['カザフ語 (Kazakh)', 'kk'],
  ['アルバニア語 (Albanian)', 'sq'],
  ['スワヒリ語 (Swahili)', 'sw'],
  ['ガリシア語 (Galician)', 'gl'],
  ['マラーティー語 (Marathi)', 'mr'],
  ['パンジャブ語 (Punjabi)', 'pa'],
  ['シンハラ語 (Sinhala)', 'si'],
  ['クメール語 (Khmer)', 'km'],
  ['ショナ語 (Shona)', 'sn'],
  ['ヨルバ語 (Yoruba)', 'yo'],
  ['ソマリ語 (Somali)', 'so'],
  ['アフリカーンス語 (Afrikaans)', 'af'],
  ['オック語 (Occitan)', 'oc'],
  ['ジョージア語 (Georgian)', 'ka'],
  ['ベラルーシ語 (Belarusian)', 'be'],
  ['タジク語 (Tajik)', 'tg'],
  ['シンド語 (Sindhi)', 'sd'],
  ['グジャラート語 (Gujarati)', 'gu'],
  ['アムハラ語 (Amharic)', 'am'],
  ['イディッシュ語 (Yiddish)', 'yi'],
  ['ラオ語 (Lao)', 'lo'],
  ['ウズベク語 (Uzbek)', 'uz'],
  ['フェロー語 (Faroese)', 'fo'],
  ['ハイチ・クレオール語 (Haitian creole)', 'ht'],
  ['パシュトゥー語 (Pashto)', 'ps'],
  ['トルクメン語 (Turkmen)', 'tk'],
  ['ノルウェー語 (Nynorsk)', 'nn'],
  ['マルタ語 (Maltese)', 'mt'],
  ['サンスクリット語 (Sanskrit)', 'sa'],
  ['ルクセンブルク語 (Luxembourgish)', 'lb'],
  ['ミャンマー語 (Myanmar)', 'my'],
  ['チベット語 (Tibetan)', 'bo'],
  ['タガログ語 (Tagalog)', 'tl'],
  ['マダガスカル語 (Malagasy)', 'mg'],
  ['アッサム語 (Assamese)', 'as'],
  ['タタール語 (Tatar)', 'tt'],
  ['ハワイ語 (Hawaiian)', 'haw'],
  ['リンガラ語 (Lingala)', 'ln'],
  ['ハウサ語 (Hausa)', 'ha'],
  ['バシキール語 (Bashkir)', 'ba'],
  ['ジャワ語 (Javanese)', 'jw'],
  ['スンダ語 (Sundanese)', 'su'],
]

export const ENCODING_UTF8 = 'utf8'
export const ENCODING_UTF8_BOM = 'utf8-bom'
export const ENCODING_UTF16LE = 'utf16le'
export const ENCODING_UTF16BE = 'utf16be'
export const ENCODING_UTF32LE = 'utf32le'
export const ENCODING_UTF32BE = 'utf32be'
export const ENCODING_CP932 = 'cp932'

export const TEXT_ENCODINGS = [
  {
    group: '一般的',
    items: [
      {label: 'UTF-8', value: ENCODING_UTF8},
      {label: 'UTF-16LE', value: ENCODING_UTF16LE},
    ]
  },
  {
    group: 'その他',
    items: [
      {label: 'UTF-8(BOM)', value: ENCODING_UTF8_BOM},
      {label: 'UTF-16BE', value: ENCODING_UTF16BE},
      {label: 'UTF-32LE', value: ENCODING_UTF32LE},
      {label: 'UTF-32BE', value: ENCODING_UTF32BE},
    ]
  },
  {
    group: '特定言語用',
    items: [
      {label: 'Shift_JIS (日本語)', value: ENCODING_CP932},
    ]
  }
]

export const OUTPUT_FORMAT_DICT = {
  vtt: {name: 'WebVTT', extensions: ['.vtt'], description: 'YouTubeやHTML5ビデオ用の字幕ファイル'},
  srt: {name: 'SubRip', extensions: ['.srt'], description: 'YouTubeやffmpeg用の字幕ファイル'},
  sbv: {name: 'SubViewer', extensions: ['.sbv'], description: ''},
  csv: {name: 'CSV', extensions: ['.csv'], description: 'カンマ(またはタブ)区切りテキストファイル'},
  txt: {name: 'プレーンテキスト', extensions: ['.txt'], description: '通常のテキストファイル'}
}

export type OUTPUT_FORMAT_TYPES = keyof typeof OUTPUT_FORMAT_DICT

export const OUTPUT_FORMATS: [OUTPUT_FORMAT_TYPES, string][] = Object.keys(OUTPUT_FORMAT_DICT).map((key: OUTPUT_FORMAT_TYPES) => {
  const {name} = OUTPUT_FORMAT_DICT[key]
  return [key, name]
})
