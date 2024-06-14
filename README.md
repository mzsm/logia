# Logia

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://makeapullrequest.com)

Automatic transcribe program for video creators.  
動画クリエイターのための自動文字起こしソフト

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
  * Apple Silicon用の機械学習フレームワーク
* [mlx-whisper](https://github.com/ml-explore/mlx-examples/tree/main/whisper)
  * OpenAI Whisper on Apple Silicon with MLX and the Hugging Face Hub.
  * MLXとHugging Face Hubを利用したApple Silicon用のOpenAI Whisper
