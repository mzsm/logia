import argparse
import multiprocessing
import os
import sys
from pathlib import Path

import ujson

if __name__ == '__main__':
    multiprocessing.freeze_support()

    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="subcommand")

    transcribe_parser = subparsers.add_parser("transcribe")
    transcribe_parser.add_argument('media_file', type=str)
    transcribe_parser.add_argument('--mlx', '-x', action='store_true',
                                   help="Use MLX version (Available only for Apple Silicon)")
    transcribe_parser.add_argument('--model', '-m', type=str, default='medium')
    transcribe_parser.add_argument('--device', '-d', type=str, default='auto',
                                   choices=('auto', 'cpu', 'cuda'))
    transcribe_parser.add_argument('--compute_type', '-c', type=str, default='auto',
                                   choices=('default', 'auto', 'int8', 'int8_float32', 'int8_float16', 'int8_bfloat16',
                                            'int16', 'float16', 'float32', 'bfloat16'))
    transcribe_parser.add_argument('--language', '-l', type=str)
    transcribe_parser.add_argument('--initial-prompt', '-p', type=str)
    transcribe_parser.add_argument('--beam_size', '-b', type=int, default=5)
    transcribe_parser.add_argument('--start', '-s', type=float, help='Start time in seconds')
    transcribe_parser.add_argument('--end', '-e', type=float, help='End time in seconds')
    transcribe_parser.add_argument('--id', '-i', type=str)

    media_info_parser = subparsers.add_parser("media_info")
    media_info_parser.add_argument('media_file', type=str)

    args = parser.parse_args()

    if args.subcommand == 'transcribe':
        # 範囲の指定
        clip_timestamps = None
        if args.start or args.end:
            clip_timestamps = [0.0]
            if args.start:
                clip_timestamps[0] = args.start
            if args.end:
                clip_timestamps.append(args.end)

        if args.mlx:
            # Apple Silicon
            from backends import mlx

            default_models = {
                'tiny': "mlx-community/whisper-tiny-mlx",
                'tiny.en': "mlx-community/whisper-tiny.en-mlx",
                'small': "mlx-community/whisper-small-mlx",
                'small.en': "mlx-community/whisper-small.en-mlx",
                'base': "mlx-community/whisper-base-mlx",
                'base.en': "mlx-community/whisper-base.en-mlx",
                'medium': "mlx-community/whisper-medium-mlx",
                'medium.en': "mlx-community/whisper-medium.en-mlx",
                'large': "mlx-community/whisper-large-mlx",
                'large-v2': "mlx-community/whisper-large-v2-mlx",
                'large-v3': "mlx-community/whisper-large-v3-mlx",
            }
            generator = mlx.transcribe(str(Path(args.media_file).absolute()),
                                       path_or_hf_repo=default_models.get(args.model, args.model),
                                       word_timestamps=True,
                                       language=args.language,
                                       clip_timestamps=clip_timestamps or '0',
                                       condition_on_previous_text=False,
                                       initial_prompt=args.initial_prompt,
                                       )
        else:
            from backends import general

            # なんとかしたい
            os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

            generator = general.transcribe(Path(args.media_file).absolute(),
                                           model_path=args.model,
                                           device=args.device,
                                           compute_type=args.compute_type,
                                           language=args.language,
                                           clip_timestamps=clip_timestamps or '0',
                                           condition_on_previous_text=False,
                                           initial_prompt=args.initial_prompt,
                                           beam_size=args.beam_size,
                                           )

        for data in generator:
            sys.stdout.write(ujson.dumps(data))
            sys.stdout.write('\n')
            sys.stdout.flush()

    if args.subcommand == 'media_info':
        from media import info

        print(info(Path(args.media_file).absolute()))
