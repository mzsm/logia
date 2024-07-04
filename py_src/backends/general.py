import os
import os.path
from typing import List, Iterable

from faster_whisper import WhisperModel as Original
from faster_whisper.transcribe import Segment


class WhisperModel(Original):
    initial_prompt_tokens = None

    def generate_segments(self, features, tokenizer, options, encoder_output=None) -> Iterable[Segment]:
        if options.initial_prompt:
            initial_prompt = " " + options.initial_prompt.strip()
            self.initial_prompt_tokens = tokenizer.encode(initial_prompt)
        return super().generate_segments(features, tokenizer, options, encoder_output)

    def get_prompt(self, tokenizer, previous_tokens, without_timestamps=False, prefix=None, hotwords=None) -> List[int]:
        return super().get_prompt(tokenizer, self.initial_prompt_tokens, without_timestamps, prefix, hotwords)


def transcribe(media_file, model_path='medium', device='auto', compute_type='default', **kwargs):
    model = WhisperModel(model_path, device=device, compute_type=compute_type)

    segments, info = model.transcribe(
        os.path.abspath(media_file),
        word_timestamps=True,
        **kwargs
    )
    yield {
        'type': 0,
        'language': info.language,
        'duration': info.duration,
    }

    for segment in segments:
        yield {
            'type': 1,
            'text': segment.text.strip(),
            'begin': segment.start,
            'end': segment.end,
            'words': [
                {
                    'word': word.word,
                    'begin': word.start,
                    'end': word.end,
                    'probability': float(word.probability)
                }
                for word in segment.words
            ],
        }

        # print("[%.3fs -> %.3fs] %s" % (segment.start, segment.end, segment.text))
        # for word in segment.words:
        #     print("    [%.3fs -> %.3fs] %s" % (word.start, word.end, word.word))
