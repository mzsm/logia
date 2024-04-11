import os.path
import sys

import ujson
from faster_whisper import WhisperModel


def transcribe(media_file, model_path='medium', device='auto', compute_type='default', language=None,
               clip_timestamps=None):
    model = WhisperModel(model_path, device=device, compute_type=compute_type)

    segments, info = model.transcribe(os.path.abspath(media_file),
                                      beam_size=5, word_timestamps=True, language=language,
                                      condition_on_previous_text=False,
                                      clip_timestamps=clip_timestamps)
    sys.stdout.write(
        ujson.dumps({
            'type': 0,
            'language': info.language,
            'duration': info.duration,
        })
    )
    sys.stdout.write('\n')
    sys.stdout.flush()

    for segment in segments:
        sys.stdout.write(
            ujson.dumps({
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
                ]
            })
        )
        sys.stdout.write('\n')
        sys.stdout.flush()
        # print("[%.3fs -> %.3fs] %s" % (segment.start, segment.end, segment.text))
        # for word in segment.words:
        #     print("    [%.3fs -> %.3fs] %s" % (word.start, word.end, word.word))
