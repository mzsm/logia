"""
Original code from https://github.com/ml-explore/mlx-examples/blob/c5da302fc4f9513023fae47f6f9b25e50388d320/whisper/mlx_whisper/audio.py
Original license:
MIT License

Copyright © 2023 Apple Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

import mlx.core as mx
import numpy as np
from mlx_whisper.audio import hanning, stft, mel_filters, N_FFT, HOP_LENGTH


def log_mel_spectrogram(
        audio: np.ndarray,
        n_mels: int = 80,
        padding: int = 0,
):
    """
    Compute the log-Mel spectrogram of

    Parameters
    ----------
    audio: Union[str, np.ndarray, mx.array], shape = (*)
        The path to audio or either a NumPy or mlx array containing the audio waveform in 16 kHz

    n_mels: int
        The number of Mel-frequency filters, only 80 is supported

    padding: int
        Number of zero samples to pad to the right

    Returns
    -------
    mx.array, shape = (80, n_frames)
        An  array that contains the Mel spectrogram
    """
    audio = mx.array(audio)

    if padding > 0:
        audio = mx.pad(audio, (0, padding))
    window = hanning(N_FFT)
    freqs = stft(audio, window, nperseg=N_FFT, noverlap=HOP_LENGTH)
    magnitudes = freqs[:-1, :].abs().square()

    filters = mel_filters(n_mels)
    mel_spec = magnitudes @ filters.T

    log_spec = mx.maximum(mel_spec, 1e-10).log10()
    log_spec = mx.maximum(log_spec, log_spec.max() - 8.0)
    log_spec = (log_spec + 4.0) / 4.0
    return log_spec
