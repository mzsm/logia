import { FormEvent, useEffect, useRef, useState } from 'react'
import { ActionIcon, Loader, RangeSlider, Select, Slider, Table } from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import {
  IconAB,
  IconAbc,
  IconArrowBigDownLines,
  IconBadgeCc,
  IconBracketsContain,
  IconBracketsContainEnd,
  IconBracketsContainStart,
  IconClockPlay,
  IconFileTextAi,
  IconFolderOpen,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconPlayerStopFilled,
  IconRewindBackward5,
  IconRewindForward10,
  IconRobot,
} from '@tabler/icons-react'
import Timeline from './components/Timeline'
import { nprogress } from '@mantine/nprogress'
import { FfmpegMediaInfo } from './features/file'
import { exportCCFile } from './features/output'
import { formatTime, parseTimeCode } from './utils'
import './App.css'

import { LANGUAGES } from './const'

const languages = LANGUAGES.map(([label, code]: [string, string]) => {
  return {label, value: code}
})
const models = [
  {label: 'Base', value: 'base'},
  {label: 'Base(英語専用)', value: 'base.en'},
  {label: 'Medium', value: 'medium'},
  {label: 'Medium(英語専用)', value: 'medium.en'},
  {label: 'Large-v2', value: 'large-v2'},
  {label: 'Large-v3', value: 'large-v3'},
]

function App() {
  const videoPanel = useRef<HTMLDivElement>(null)
  const videoTag = useRef<HTMLVideoElement>(null)
  const [mediaFilePath, setMediaFilePath] = useState<string>(null)
  const [mediaInfo, setMediaInfo] = useState<FfmpegMediaInfo>(null)
  const [duration, setDuration] = useState<number>(0)
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 0])
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState<number>(1.0)
  const [abEnabled, setAbEnabled] = useState(false)
  const [language, setLanguage] = useState<string>(navigator.language.split('-')[0])
  const [model, setModel] = useState<string>('medium')
  const [inSelection, setInSelection] = useState(false)
  const [transcriptionPromise, setTranscriptionPromise] = useState<Promise<unknown>>(null)
  const [transcript, setTranscript] = useState<{ type: number; begin: number; end: number; text: string }[]>([])
  const [latestTranscript, setLatestTranscript] = useState<{ type: number; begin: number; end: number; text: string }[]>([])
  const [autoScroll, setAutoScroll] = useState(false)
  const [segmentUpdated, setSegmentUpdated] = useState<{index: number; begin: number; end: number}>()
  // const [timeline, setTimeline] = useState<TimelineRow[]>([])

  const _setLanguage = (value: string) => {
    setLanguage(value)
    if (value) {
      window.electronAPI.setConfig({
        language: value,
      })
    }
  }
  const _setModel = (value: string) => {
    setModel(value)
    if (value) {
      window.electronAPI.setConfig({
        model: value,
      })
    }
  }

  const openMedia = (filePath: string) => {
    window.electronAPI.getMediaInfo(filePath).then((_mediaInfo) => {
      setMediaInfo(_mediaInfo)
      setDuration(_mediaInfo.duration / 1000)
      setTimeRange([0, _mediaInfo.duration / 1000])
      setTranscript([])
    })
    setMediaFilePath(filePath)
    videoTag.current.src = 'file://' + filePath
  }

  const playMedia = () => {
    videoTag.current.play()
  }
  const pauseMedia = () => {
    videoTag.current.pause()
  }
  const rawMedia = (time: number) => {
    videoTag.current.currentTime -= time
  }
  const ffMedia = (time: number) => {
    videoTag.current.currentTime += time
  }
  const onTimeUpdate = () => {
    setCurrentTime(videoTag.current.currentTime)
    // AB再生中
    if (abEnabled && !videoTag.current.paused) {
      if (videoTag.current.currentTime > timeRange[1] || videoTag.current.currentTime < timeRange[0]) {
        videoTag.current.currentTime = timeRange[0]
      }
    }
  }

  const onTimeInput = (event: FormEvent<HTMLInputElement>) => {
    const _time = parseTimeCode((event.target as HTMLInputElement).value)
    if (!isNaN(_time)) {
      // setCurrentTime(_time)
      videoTag.current.currentTime = _time
    }
  }

  // ツールバーの開くボタンクリック時
  const onClickMediaOpen = () => {
    window.electronAPI.openMediaFile().then((media) => {
      if (media) {
        openMedia(media)
      }
    })
  }
  // 字幕ファイル出力
  const onClickExportCC = () => {
    window.electronAPI.exportCC().then((filePath) => {
      if (filePath) {
        exportCCFile(filePath, transcript)
      }
    })
  }


  const onClickStartTranscription = async () => {
    if (!mediaFilePath) {
      return
    }
    await window.electronAPI.abortTranscription()
    setTranscript([])
    nprogress.set(0)

    // 書き起こしを実行し、Promiseを変数に代入
    const args: { filePath: string; language?: string; model?: string; start?: number; end?: number } = {
      filePath: mediaFilePath,
      language: language,
      model: model,
    }
    if (inSelection) {
      args.start = timeRange[0]
      args.end = timeRange[1]
    }
    const promise = window.electronAPI.startTranscription(args)
    promise.then(() => {
      nprogress.complete()
    })
    promise.finally(() => {
      setTranscriptionPromise(null)
    })

    setTranscriptionPromise(promise)
  }
  const onClickAbortTranscription = () => {
    window.electronAPI.abortTranscription()
  }

  useEffect(() => {
    if (segmentUpdated) {
      transcript[segmentUpdated.index].begin = segmentUpdated.begin
      transcript[segmentUpdated.index].end = segmentUpdated.end
      setTranscript([
        ...transcript.slice(0, segmentUpdated.index),
        transcript[segmentUpdated.index],
        ...transcript.slice(segmentUpdated.index + 1)
      ])
    }
  }, [segmentUpdated])

  // useEffect(() => {
  //   videoTag.current.ontimeupdate
  //   videoTag.current.src = mediaFilePath + (abEnabled ? `#t=${timeRange[0]},${timeRange[1]}` : '')
  // }, [abEnabled, timeRange])

  useEffect(() => {
    videoTag.current.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const _transcript = [...transcript, ...latestTranscript.filter((line) => line.type === 1)]
    setTranscript(_transcript)
    // 進捗を更新
    if (videoTag && _transcript.length) {
      nprogress.set(_transcript[_transcript.length - 1]?.end / videoTag.current.duration / 10)
    }
  }, [latestTranscript, videoTag])

  useEffect(() => {
    // メニューから開かれた場合
    window.electronAPI.onOpenMedia(openMedia)
    window.electronAPI.onTranscriptionProgress((data) => {
      setLatestTranscript(data as { type: number; begin: number; end: number; text: string }[])
    })

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.attributeName === 'style') {
          window.electronAPI.setConfig({previewHeight: parseInt(videoPanel.current.style.height, 10)})
        }
      })
    })
    mutationObserver.observe(videoPanel.current, {attributes: true})

    window.electronAPI.getConfig('previewHeight').then((value: string) => {
      videoPanel.current.style.height = value + 'px'
    })
    window.electronAPI.getConfig('language').then((value: string) => {
      setLanguage(value)
    })
    window.electronAPI.getConfig('model').then((value: string) => {
      setModel(value)
    })
  }, [])

  return (
    <div className="App">
      <div className="tool-bar">
        <div>
          <ActionIcon
            variant="default"
            radius="sm"
            onClick={onClickMediaOpen}
          >
            <IconFolderOpen size={16} stroke={1.5}/>
          </ActionIcon>
        </div>
        <div>
          <ActionIcon
            variant="default"
            radius="sm"
            onClick={onClickExportCC}
            disabled={!transcript.length || !!transcriptionPromise}
          >
            <IconBadgeCc size={16} stroke={1.5}/>
          </ActionIcon>
        </div>
      </div>
      <div
        className="video-panel"
        ref={videoPanel}
      >
        <video
          className="preview-player"
          disablePictureInPicture
          preload="auto"
          ref={videoTag}
          onTimeUpdate={onTimeUpdate}
        >
        </video>
      </div>
      {
        mediaFilePath ?
          <div style={{width: '100%'}}>
            <Timeline
              player={videoTag}
              src={mediaFilePath}
              autoScroll
              data={transcript}
              setAligns={(d) => setSegmentUpdated(d)}
            />
          </div> :
          <></>
      }
      <div className="tool-bar" style={{flexWrap: 'wrap'}}>
        <div className="controls">
          <ActionIcon.Group
          >
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => {
                videoTag.current.pause()
                videoTag.current.currentTime = timeRange[0]
              }}
            >
              <IconPlayerSkipBack size={24} stroke={1.5}/>
            </ActionIcon>
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => setTimeRange([videoTag.current.currentTime, Math.max(videoTag.current.currentTime, timeRange[1])])}
            >
              <IconBracketsContainStart size={24} stroke={1.5}/>
            </ActionIcon>
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => rawMedia(5)}
            >
              <IconRewindBackward5 size={24} stroke={1.5}/>
            </ActionIcon>
            {
              videoTag.current?.paused ?
                <ActionIcon
                  variant="default"
                  disabled={!mediaFilePath}
                  size="lg"
                  radius="sm"
                  onClick={playMedia}
                >
                  <IconPlayerPlay size={24} stroke={1.5}/>
                </ActionIcon> :
                <ActionIcon
                  variant="default"
                  disabled={!mediaFilePath}
                  size="lg"
                  radius="sm"
                  onClick={pauseMedia}
                >
                  <IconPlayerPause size={24} stroke={1.5}/>
                </ActionIcon>
            }
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => ffMedia(10)}
            >
              <IconRewindForward10 size={24} stroke={1.5}/>
            </ActionIcon>
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => setTimeRange([Math.min(timeRange[0], videoTag.current.currentTime), videoTag.current.currentTime])}
            >
              <IconBracketsContainEnd size={24} stroke={1.5}/>
            </ActionIcon>
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => {
                videoTag.current.pause()
                videoTag.current.currentTime = timeRange[1]
              }}
            >
              <IconPlayerSkipForward size={24} stroke={1.5}/>
            </ActionIcon>
          </ActionIcon.Group>
          <div className="controls">
            <ActionIcon
              variant="default"
              disabled={!mediaFilePath}
              size="lg"
              radius="sm"
              onClick={() => {
                setSpeed(1)
              }}
              title="再生速度"
            >
              <IconClockPlay size={24} stroke={1.5}/>
            </ActionIcon>
            <Slider
              disabled={!mediaFilePath}
              value={speed}
              onChange={setSpeed}
              min={0.25}
              max={2.0}
              marks={[
                {value: 1},
              ]}
              radius="md"
              size="md"
              step={0.25}
              style={{width: '80px'}}
            />
          </div>

          <TimeInput
            value={formatTime(videoTag.current?.currentTime)}
            onChange={onTimeInput}
            disabled={!mediaFilePath}
            size="sm"
            maxTime={formatTime(duration)}
            withSeconds
          />
          <span>/</span>
          <TimeInput
            value={formatTime(duration)}
            disabled={!mediaFilePath}
            variant="unstyled"
            size="sm"
            withSeconds
            readOnly
          />
        </div>

      </div>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <span>
          <IconFileTextAi size={24} stroke={1}/>
        </span>
        <span>言語:</span>
        <Select
          id="language"
          placeholder="language"
          data={languages}
          value={language}
          onChange={_setLanguage}
          checkIconPosition="right"
          allowDeselect={false}
          size="sm"
          radius="sm"
          searchable
        />
        <span>モデル:</span>
        <Select
          id="model"
          placeholder="model"
          data={models}
          value={model}
          onChange={_setModel}
          checkIconPosition="right"
          allowDeselect={false}
          size="sm"
          radius="sm"
          searchable
        />
        <span>
          <ActionIcon
            variant={inSelection ? 'light' : 'default'}
            size="36"
            radius="sm"
            disabled={!mediaFilePath}
            onClick={() => setInSelection(!inSelection)}
            title="選択範囲のみ"
          >
            <IconBracketsContain size={16} stroke={1.5}/>
          </ActionIcon>
        </span>
        <span>
          {
            transcriptionPromise ?
              <ActionIcon
                variant="outline"
                size="36"
                radius="sm"
                color="red"
                disabled={!mediaFilePath}
                onClick={onClickAbortTranscription}
                title="自動書き起こしを中止"
              >
                <IconPlayerStopFilled size={16} stroke={1.5}/>
              </ActionIcon> :
              <ActionIcon
                size="36"
                radius="sm"
                onClick={onClickStartTranscription}
                disabled={!mediaFilePath}
                title="自動書き起こしを開始"
              >
                <IconPlayerPlayFilled size={16} stroke={1.5}/>
              </ActionIcon>
          }
        </span>
      </div>
      <div className="bottom-panel">
        <Table.ScrollContainer
          minWidth={300}
          style={{height: '100%'}}>
          <Table
            stickyHeader
            stickyHeaderOffset={0}
            highlightOnHover
            style={{height: '100%'}}
            className="transcript-list"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <ActionIcon
                    variant={autoScroll ? 'light' : 'default'}
                    size="24"
                    radius="sm"
                    disabled={!autoScroll}
                    onClick={() => setAutoScroll(!autoScroll)}
                    title="自動スクロール"
                  >
                    <IconArrowBigDownLines size={16} stroke={1.5}/>
                  </ActionIcon>
                </Table.Th>
                <Table.Th>From</Table.Th>
                <Table.Th>To</Table.Th>
                <Table.Th>Text</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {
                transcript.map((segment, index) => (
                  <Table.Tr key={index}>
                    <Table.Td style={{whiteSpace: 'nowrap'}}>
                      <ActionIcon.Group
                        className="player-actions"
                      >
                        <ActionIcon
                          variant="default"
                          size="sm"
                          radius="sm"
                          title="ここから再生"
                          onClick={() => {
                            videoTag.current.currentTime = segment.begin
                            setAbEnabled(false)
                            videoTag.current.play()
                          }}
                        >
                          <IconPlayerPlay size={16} stroke={1.5}/>
                        </ActionIcon>
                        <ActionIcon
                          variant="default"
                          size="sm"
                          radius="sm"
                          title="AB再生(区間内リピート再生)"
                          onClick={() => {
                            const _timeRange: [number, number] = [segment.begin, segment.end]
                            setAbEnabled(true)
                            setTimeRange(_timeRange)
                            videoTag.current.currentTime = _timeRange[0]
                            videoTag.current.play()
                          }}
                        >
                          <IconAB size={16} stroke={1.5}/>
                        </ActionIcon>
                      </ActionIcon.Group>
                    </Table.Td>
                    <Table.Td style={{whiteSpace: 'nowrap'}}>{formatTime(segment.begin, true)}</Table.Td>
                    <Table.Td style={{whiteSpace: 'nowrap'}}>{formatTime(segment.end, true)}</Table.Td>
                    <Table.Td className="transcript-text">{segment.text}</Table.Td>
                  </Table.Tr>
                ))
              }
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
      {
        transcriptionPromise ?
          <div className="footer-panel">
            <div className="loader">
              <Loader size={36}/>
              <IconAbc className="abc" size={24} stroke={1.5}/>
              <IconPencil className="pencil" size={24} stroke={1.5}/>
              <IconRobot size={36} stroke={1}/>
            </div>
            <div>
            </div>
          </div> :
          ''
      }
    </div>
  )
}

export default App
