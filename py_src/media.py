import av
import ujson
from av.container.input import InputContainer
from faster_whisper import format_timestamp


def info(media_path):
    media: InputContainer = av.open(media_path)
    return ujson.dumps({
        'format': media.format.name,
        'format_long': media.format.long_name,
        'duration': media.duration // 1000,
        'duration_time': format_timestamp(media.duration / 1000000),
        'bit_rate': media.bit_rate,
        'video': [
            {
                'name': stream.codec_context.name,
                'profile': stream.codec_context.profile,
                'width': stream.codec_context.width,
                'height': stream.codec_context.height,
                'bit_rate': stream.codec_context.bit_rate_tolerance,
                'frame_rate': int(float(stream.base_rate) * 1000) / 1000,
            }
            for stream in media.streams.video
        ],
        'audio': [
            {
                'name': stream.codec_context.name,
                'profile': stream.profile,
                'bit_rate': stream.codec_context.bit_rate,
                'sample_rate': stream.codec_context.sample_rate,
                'channels': stream.codec_context.channels,
            }
            for stream in media.streams.audio
        ],
        'format_text': media.dumps_format(),
    })
