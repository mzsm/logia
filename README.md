# Logia

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

Automatic transcribe program for video creators.  
動画クリエイターのための自動文字起こしソフト

## System requirements

* OS
  * As new and stable as possible (Whether Windows or macOS)  
    なるべく新しくて安定してるやつ (WindowsでもmacOSでも)
* CPU
  * As fast as possible  
    なるべく速いやつ
* Memory
  * As much as possible  
    なるべくたくさん

### Recommended

The program work faster, if your computer equipped with below H/W.  
コンピュータに以下のハードウェアが搭載されていれば、より高速に動作します

#### on Windows
* with CUDA supported NVIDIA GPU  
  CUDA対応のNVIDIA製GPU搭載

#### on macOS
* with Apple Silicon  
  Appleシリコン搭載

## Performances

Processing time is depending on audio.  
There are samples.

### Sample #1
* Lang: Japanese
* Duration: 20:03
* Genre: Talk (Conversation)

#### CPU only
| CPU           | Mem. | Model    | Time  | Speed |
|---------------|------|----------|-------|-------|
| Ryzen 7 7840U | 32GB | Medium   | 12:14 | x1.63 |
| Ryzen 7 7840U | 32GB | Large-v3 | 19:38 | x1.02 |

#### with CUDA supported NVIDIA GPU
| CPU | GPU     | Mem. | Model    | Time  | Speed |
|-----|---------|------|----------|-------|-------|
|     | GeForce | 32GB | Medium   |       |       |
|     | GeForce | 32GB | Large-v3 |       |       |

#### with Apple Silicon
| CPU/GPU  | Mem. | Model    | Time  | Speed |
|----------|------|----------|-------|-------|
| Apple M2 | 24GB | Medium   | 03:42 | x5.42 |
| Apple M2 | 24GB | Large-v3 | 06:25 | x3.12 |

### Sample #2
* Lang: English
* Duration: 21:03
* Genre: Speech

#### with Apple Silicon
| CPU/GPU  | Mem. | Model     | Time  | Speed |
|----------|------|-----------|-------|-------|
| Apple M2 | 24GB | Medium    | 03:19 | x6.37 |
| Apple M2 | 24GB | Large-v3  | 05:55 | x3.56 |

## Dependencies

This program is developed with below ones.  
このプログラムは以下のプログラムを利用して開発されています

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
