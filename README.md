# Logia

![GitHub License](https://img.shields.io/github/license/mzsm/logia?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/mzsm/logia?style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

Transcription and subtitling support app for video creators.  
動画クリエイターのための文字起こし・字幕制作支援アプリ

## What Can This App Do For You? / 何ができるの？

Transcribes video / audio files automatically with speech recognition.  
It supports about 100 languages, such as English, Japanese, Chinese, French, Korean, etc...  
You can correct it manually if the result was wrong,   
It supports to output subtitle files for YouTube and HTML5 videos, and you can add high-quality subtitles to your videos easily.  
Also available to output CSV and plain text, you can use for a wide range of use cases, not only video creation.  
FYI, speech recognition is processed on your machine, so the audio data is never sent outside.

音声認識により自動で動画・音声ファイルの文字起こしを行います  
英語や日本語、中国語、フランス語、韓国語など、約100の言語に対応しています  
自動文字起こしの結果が間違っていた場合は、手動で内容を修正できます  
YouTubeやHTML5ビデオ用字幕ファイルの出力に対応しており、動画に高品質な字幕を手軽に付与できます  
また、CSVやプレーンテキストでの出力も可能なので、動画制作だけでなく幅広い用途で利用可能です  
なお、音声認識処理はローカルマシン上で実行されるため、音声データが外部に送信されることはありません

## System Requirements / 動作環境

* OS
  * As new and stable as possible (Whether Windows or macOS)  
    なるべく新しくて安定してるやつ (WindowsでもmacOSでも)
  * macOS >= 13.5 (with Apple Silicon)  
    Apple Silicon搭載macの場合、macOS 13.5以上
* CPU
  * As fast as possible  
    なるべく速いやつ
* Memory
  * As much as possible  
    なるべくたくさん

### Recommended / 推奨環境

The app work faster, if your computer equipped with below H/W.  
コンピューターに以下のハードウェアが搭載されていれば、より高速に動作します

#### on Windows
* with CUDA supported NVIDIA GPU  
  CUDA対応のNVIDIA製GPU搭載

#### on macOS
* with Apple Silicon  
  Appleシリコン搭載

## Performance Benchmark Results / 性能ベンチマーク結果

Below are sample data measured by developer or friends.  
Processing time is heavily depending on your PC specs, the content of the audio or other reasons.  
These are intended as a guide only.

以下は開発者や友人が測定したサンプルデータです  
処理時間はPCのスペックや音声の内容などにより大きく左右されます  
あくまで目安として参考にしてください

### Sample #1
* Lang / 言語
  * Japanese / 日本語
* Duration / 再生時間
  * 20:03
* Genre / ジャンル
  * Conversation of two / 2人の会話

#### CPU Only
| CPU           | Mem. | Model    |  Time | Speed |
|---------------|-----:|----------|------:|------:|
| Ryzen 7 7840U | 32GB | Medium   | 12:14 | x1.63 |
| Ryzen 7 7840U | 32GB | Large-v3 | 19:38 | x1.02 |

#### with CUDA supported NVIDIA GPU
| CPU            | GPU                 | Mem. | Model    |  Time |  Speed |
|----------------|---------------------|-----:|----------|------:|-------:|
| i7-6700K       | GeForce GTX 1070 Ti | 32GB | Medium   | 05:03 |  x3.97 |
| i7-6700K       | GeForce GTX 1070 Ti | 32GB | Large-v3 | 08:13 |  x2.44 |
| Ryzen 7 7745HX | GeForce RTX 4090    | 64GB | Medium   | 01:14 | x16.45 |
| Ryzen 7 7745HX | GeForce RTX 4090    | 64GB | Large-v3 | 01:27 | x13.86 |

#### with Apple Silicon
| CPU/GPU  | GPU Cores | Mem. | Model    |  Time | Speed |
|----------|----------:|-----:|----------|------:|------:|
| Apple M1 |         8 | 16GB | Medium   | 04:46 | x4.20 |
| Apple M1 |         8 | 16GB | Large-v3 | 08:50 | x2.27 |
| Apple M2 |        10 | 24GB | Medium   | 03:42 | x5.42 |
| Apple M2 |        10 | 24GB | Large-v3 | 06:25 | x3.12 |

### Sample #2
* Lang / 言語
  * English / 英語
* Duration / 再生時間
  * 21:03
* Genre / ジャンル
  * Solo speech / 1人によるスピーチ

#### CPU Only
| CPU           | Mem. | Model    |  Time | Speed |
|---------------|-----:|----------|------:|------:|
| Ryzen 7 7840U | 32GB | Medium   | 10:59 | x1.91 |
| Ryzen 7 7840U | 32GB | Large-v3 | 15:04 | x1.39 |

#### with CUDA supported NVIDIA GPU
| CPU            | GPU                 | Mem. | Model    |  Time |  Speed |
|----------------|---------------------|-----:|----------|------:|-------:|
| i7-6700K       | GeForce GTX 1070 Ti | 32GB | Medium   | 05:05 |  x4.14 |
| i7-6700K       | GeForce GTX 1070 Ti | 32GB | Large-v3 | 06:21 |  x3.31 |
| Ryzen 7 7745HX | GeForce RTX 4090    | 64GB | Medium   | 01:04 | x19.76 |
| Ryzen 7 7745HX | GeForce RTX 4090    | 64GB | Large-v3 | 01:18 | x16.37 |

#### with Apple Silicon
| CPU/GPU  | GPU Cores | Mem. | Model    | Time  | Speed |
|----------|----------:|-----:|----------|-------|-------|
| Apple M1 |         8 | 16GB | Medium   | 04:28 | x4.72 |
| Apple M1 |         8 | 16GB | Large-v3 | 08:08 | x2.59 |
| Apple M2 |        10 | 24GB | Medium   | 03:19 | x6.37 |
| Apple M2 |        10 | 24GB | Large-v3 | 05:55 | x3.56 |

## Dependencies / 依存ライブラリー

This app is developed with below libraries.  
このアプリは以下のライブラリーを利用して開発されています

* [Faster Whisper](https://github.com/SYSTRAN/faster-whisper)
  * A reimplementation of OpenAI's Whisper model using [CTranslate2](https://github.com/OpenNMT/CTranslate2/).
  * [CTranslate2](https://github.com/OpenNMT/CTranslate2/)を用いたOpenAI Whisperモデルの再実装
  * (Original)
    * [Whisper](https://github.com/openai/whisper)
      * A set of open source speech recognition models from OpenAI.
      * OpenAIによるオープンソースの音声認識モデルセット

### on Apple Silicon

* [MLX](https://github.com/ml-explore/mlx)
  * An array framework for machine learning research on Apple Silicon.
  * Appleシリコン用の機械学習フレームワーク
* [mlx-whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
  * OpenAI Whisper on Apple Silicon with MLX and the Hugging Face Hub.
  * MLXとHugging Face Hubを利用したAppleシリコン用のOpenAI Whisper

## License / ライセンス

[MIT License](LICENSE)

## Where The Name Come From / 名前の由来

**Logia** comes from Greek word [**λόγια**](https://en.wiktionary.org/wiki/%CE%BB%CF%8C%CE%B3%CE%B9%CE%B1) (the plural of [**λόγος**](https://en.wiktionary.org/wiki/%CE%BB%CF%8C%CE%B3%CE%BF%CF%82) (logos)) which meanings *words*. And also pun for *log* and *AI*.  
**Logia**(ロギア)の由来はギリシア語で「言葉」を意味する単語 [**λόγια**](https://en.wiktionary.org/wiki/%CE%BB%CF%8C%CE%B3%CE%B9%CE%B1) (※[**λόγος**](https://en.wiktionary.org/wiki/%CE%BB%CF%8C%CE%B3%CE%BF%CF%82)(ロゴス)の複数形)で、また*log*と*AI*にも掛けています
