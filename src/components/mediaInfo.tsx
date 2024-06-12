import { CSSProperties } from 'react'
import { FfmpegMediaInfo } from '../features/file'
import { HoverCard } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { formatTime } from '../utils'
import prettyBytes from 'pretty-bytes'

interface Props {
  mediaInfo: FfmpegMediaInfo
  style?: CSSProperties
}

function MediaInfo({mediaInfo, style}: Props) {
  return (
    <HoverCard width="auto" position="bottom" withArrow shadow="md" disabled={!mediaInfo}>
      <HoverCard.Target>
        <IconInfoCircle size={20} stroke={1.5} style={style}/>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        {
          mediaInfo ?
            <table>
              <tbody>
              <tr>
                <td>フォーマット</td>
                <td>{mediaInfo.format_long}</td>
              </tr>
              <tr>
                <td>再生時間</td>
                <td>{formatTime(mediaInfo.duration, true, true)}</td>
              </tr>
              <tr>
                <td>ビットレート</td>
                <td>{prettyBytes(mediaInfo.bit_rate, {bits: true})}/s</td>
              </tr>
              {
                mediaInfo.video ?
                  mediaInfo.video.map((_video, index) =>
                    <tr key={`video_${index}`}>
                      <td>映像{index + 1}</td>
                      <td>
                        {_video.name}<br/>
                        {_video.width}x{_video.height}<br/>
                        {_video.frame_rate} fps
                      </td>
                    </tr>
                  ) :
                  <></>
              }
              {
                mediaInfo.audio ?
                  mediaInfo.audio.map((_audio, index) =>
                    <tr key={`audio_${index}`}>
                      <td>音声{index + 1}</td>
                      <td>
                        {_audio.name} {_audio.profile}<br/>
                        {_audio.channels} ch<br/>
                        {
                          _audio.bit_rate ?
                            <>{prettyBytes(_audio.bit_rate, {bits: true})}/s</> :
                            ''
                        }
                      </td>
                    </tr>
                  ) :
                  <></>
              }
              </tbody>
            </table> :
            <></>
        }
      </HoverCard.Dropdown>
    </HoverCard>
  )
}

export default MediaInfo
