import { DragEvent, useEffect, useRef, useState } from 'react'
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useDisclosure } from '@mantine/hooks'
import { ActionIcon, Divider, Group, SegmentedControl, Slider, Stack, Text } from '@mantine/core'
import TimeStampInput from './components/timeStampInput'
import {
  IconAbc,
  IconArrowBigRightLines,
  IconBadgeCc,
  IconBan,
  IconClockPlay,
  IconFileTextAi,
  IconFolderOpen,
  IconMovieOff,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconPlus,
  IconRewindBackward5,
  IconRewindForward10,
  IconRobot,
  IconX,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react'
import TranscriptionModal from './components/transcriptionModal'
import VideoEngine from './components/timelineEngine'
import TimelineTable from './components/timelineTable'
import TextEditArea from './components/textEditArea'
import { Timeline, TimelineEngine, TimelineState } from 'react-timeline-editor'
import { FfmpegMediaInfo } from './features/file'
// import { exportCCFile } from './features/output'
import { formatTime } from './utils'
import { TranscriptionRow, TranscriptionText } from './declare'
import './App.css'
import MediaInfo from './components/mediaInfo'
import OutputModal from './components/outputModal'

const START_LEFT = 30
const SCALE_WIDTH = 160

function App() {
  const [isAppleSilicon, setIsAppleSilicon] = useState<boolean>(false)
  const videoTag = useRef<HTMLVideoElement>(null)
  const timelineHeader = useRef<HTMLDivElement>(null)
  const timelineState = useRef<TimelineState>(null)
  const [mediaFilePath, setMediaFilePath] = useState<string>(null)
  const [mediaInfo, setMediaInfo] = useState<FfmpegMediaInfo>(null)
  const [audioOnly, setAudioOnly] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPaused, setIsPaused] = useState<boolean>(true)
  const [speed, setSpeed] = useState<number>(1.0)
  const [autoScroll, setAutoScroll] = useState(false)
  const _autoScroll = useRef(autoScroll)
  const [isOpenedTranscriptionDialog, {
    open: openTranscriptionDialog,
    close: closeTranscriptionDialog,
  }] = useDisclosure(false)
  const [isOpenedExportDialog, {
    open: openExportDialog,
    close: closeExportDialog,
  }] = useDisclosure(false)
  const [timelineData, setTimelineData] = useState<TranscriptionRow[]>([])
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<TranscriptionRow>(null)
  // const [selectedTextList, setSelectedTextList] = useState<TranscriptionText[]>([])
  const [activeTextId, setActiveTextId] = useState<string>(null)
  const [activeText, setActiveText] = useState<TranscriptionText>(null)
  const [currentTextId, setCurrentTextId] = useState<string>(null)

  const [engine, setEngine] = useState<TimelineEngine>(null)
  const [scales, setScales] = useState<number[]>([])
  const [scaleLevel, setScaleLevel] = useState(0)
  const [scale, setScale] = useState(1)
  const _scale = useRef(scale)
  const [processingTranscriptions, setProcessingTranscriptions] = useState<{[id: string]: Promise<unknown>}>({})

  const mainHorizontalGrid = useRef<ImperativePanelGroupHandle>(null)
  const [mainHorizontalGridRatio, setMainHorizontalGridRatio] = useState(null)
  const _mainHorizontalGridRatio = useRef(mainHorizontalGridRatio)
  const mainVerticalGrid = useRef<ImperativePanelGroupHandle>(null)
  const [mainVerticalGridRatio, setMainVerticalGridRatio] = useState(null)
  const _mainVerticalGridRatio = useRef(mainVerticalGridRatio)
  const sideVerticalGrid = useRef<ImperativePanelGroupHandle>(null)
  const [sideVerticalGridRatio, setSideVerticalGridRatio] = useState<[number, number]>(null)
  const _sideVerticalGridRatio = useRef(sideVerticalGridRatio)
  const sideTop = useRef(null)

  useEffect(() => {
    const _d = Math.max(1, duration / 2)
    const _scales = [1, 2, 3, 4, 5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 600, 900, 1200, 1800, 2700, 3600]
      .filter((x) => x <= _d).reverse()
    setScaleLevel((v) => Math.min(_scales.length - 1, v))
    setScales(_scales)
  }, [duration])

  useEffect(() => {
    setScale(scales[scaleLevel])
  }, [scales, scaleLevel])

  useEffect(() => {
    _autoScroll.current = autoScroll
  }, [autoScroll])

  useEffect(() => {
    _scale.current = scale
  }, [scale])

  useEffect(() => {
    setAudioOnly(mediaInfo && mediaInfo.video.length === 0)
  }, [mediaInfo])

  useEffect(() => {
    let found = false
    timelineData.map((timeline) => {
      if (timeline.id == selectedRowId) {
        setSelectedRow(timeline)
        found = true
      }
    })
    if (!found) {
      setSelectedRow(null)
    }
    _scale.current = scale
  }, [selectedRowId, timelineData])

  useEffect(() => {
    for (let i = 0; i < timelineData.length; i++) {
      const _timeline = timelineData[i]
      for (let l = 0; l < _timeline.actions.length; l++) {
        const text = _timeline.actions[l]
        if (activeTextId == text.id) {
          setActiveText(text)
          return
        }
      }
    }
    setActiveText(null)
  }, [timelineData, activeTextId])

  // パネルの幅・高さを保存する
  useEffect(() => {
    if (mainHorizontalGridRatio) {
      _mainHorizontalGridRatio.current = mainHorizontalGridRatio
      window.electronAPI.setConfig({'mainHorizontalGridRatio': mainHorizontalGridRatio})
    }
  }, [mainHorizontalGridRatio])

  useEffect(() => {
    if (mainVerticalGridRatio) {
      _mainVerticalGridRatio.current = mainVerticalGridRatio
      window.electronAPI.setConfig({'mainVerticalGridRatio': mainVerticalGridRatio})
    }
  }, [mainVerticalGridRatio])

  useEffect(() => {
    if (sideVerticalGridRatio) {
      _sideVerticalGridRatio.current = sideVerticalGridRatio
      window.electronAPI.setConfig({'sideVerticalGridRatio': sideVerticalGridRatio})
    }
  }, [sideVerticalGridRatio])

  // on File Drop
  const onFileDrop = (e: DragEvent) => {
    if (e.dataTransfer.files.length) {
      const _file = e.dataTransfer.files[0]
      openMedia(_file.path).then()
    }
    e.preventDefault()
  }

  const openMedia = async (filePath: string) => {
    // 初期化
    if (mediaFilePath && !confirm('現在編集中のファイルを閉じてもよろしいですか?')) {
      return
    }

    pauseMedia()
    setIsPaused(true)
    setTime(0)
    engine?.setTime(0)
    timelineState.current?.setTime(0)
    timelineState.current?.setScrollLeft(0)
    setTimelineData([])
    setActiveTextId(null)
    setSelectedRowId(null)
    videoTag.current.src = null

    const _mediaInfo = await window.electronAPI.getMediaInfo(filePath)
    if (!_mediaInfo) {
      alert('この形式のファイルには対応していません')
      return
    }

    setMediaInfo(_mediaInfo)
    setDuration(_mediaInfo.duration / 1000)
    setMediaFilePath(filePath)
    videoTag.current.src = 'file://' + encodeURIComponent(filePath).replaceAll('%2F', '/')
  }

  const setTime = (time: number) => {
    videoTag.current.currentTime = time
  }

  const playMedia = () => {
    engine?.play({})
  }
  const pauseMedia = () => {
    engine?.pause()
  }
  const rawMedia = (time: number) => {
    setTime(videoTag.current.currentTime - time)
  }
  const ffMedia = (time: number) => {
    setTime(videoTag.current.currentTime + time)
  }
  const onTimeUpdate = () => {
    setCurrentTime(videoTag.current.currentTime)

    if (selectedRow) {
      for (let i = 0; i < selectedRow.actions.length; i++) {
        if (selectedRow.actions[i].start <= currentTime && currentTime <= selectedRow.actions[i].end) {
          setCurrentTextId(selectedRow.actions[i].id)
          return
        } else if (currentTime <= selectedRow.actions[i].start) {
          return
        }
      }
      setCurrentTextId(null)
    }
  }

  const onTimeInput = (timeStamp: number) => {
    setTime(timeStamp)
  }

  // 編集中のテキストを削除
  const removeActiveText = () => {
    setActiveTextId(null)

    setTimelineData((_timelineData) => {
      _timelineData.forEach((_timeline) => {
        _timeline.actions = _timeline.actions.filter((text) => {
          return activeTextId !== text.id
        })
      })
      return structuredClone(_timelineData)
    })
  }

  // ツールバーの開くボタンクリック時
  const onClickMediaOpen = () => {
    window.electronAPI.openMediaFile().then((media) => {
      if (media) {
        openMedia(media).then()
      }
    })
  }

  const onClickStartTranscription = (id: string, promise: Promise<unknown>, name: string) => {
    const actions: TranscriptionText[] = []
    const row = {
      id: id,
      name: name,
      actions,
    }
    setTimelineData(timelineData.concat([row]))
    setProcessingTranscriptions((v) => {
      return Object.assign({[id]: promise}, v)
    })

    promise.then(() => {
      setProcessingTranscriptions((v) => {
        delete v[id]
        return Object.assign({}, v)
      })
      updateTimelineData()
    })
  }

  // const onClickAbortTranscription = () => {
  //   window.electronAPI.abortTranscription()
  // }

  const addEmptyTimeline = () => {
    setTimelineData((_timelineData) => {
      const timelineNames = _timelineData.map((_timeline) => _timeline.name)
      let name = ''
      let suffix = 0
      do {
        name = `無題のタイムライン${suffix ? ` (${suffix})` : ''}`
        suffix++
      } while (timelineNames.includes(name))
      _timelineData = _timelineData.concat([{
        id: new Date().getTime().toString(),
        name: name,
        progress: false,
        actions: [],
      } as TranscriptionRow])
      return structuredClone(_timelineData)
    })
  }

  const removeTimeline = (id: string) => {

    setTimelineData((_timelineData) => {
      return structuredClone(_timelineData.filter((_timeline) => _timeline.id !== id))
    })
  }

  useEffect(() => {
    videoTag.current.playbackRate = speed
  }, [speed])

  // パネルの幅・高さが変更されたとき
  const onResizeMainHorizontalGrid = (sizes: [number, number]) => {
    setMainHorizontalGridRatio(sizes)
  }
  const onResizeMainVerticalGrid = (sizes: [number, number]) => {
    setMainVerticalGridRatio(sizes)
  }
  const onResizeSideVerticalGrid = (sizes: [number, number]) => {
    setSideVerticalGridRatio(sizes)
  }

  const updateTimelineData = () => {
    setTimelineData((c) => structuredClone(c))
  }

  useEffect(() => {
    window.electronAPI.isAppleSilicon().then((_isAppleSilicon) => {
      setIsAppleSilicon(_isAppleSilicon)
    })

    if (!engine) {
      // メニューから開かれた場合
      window.electronAPI.onOpenMedia(openMedia)

      window.electronAPI.onTranscriptionProgress(({id, data}) => {
        setTimelineData((timelineData) => {
          const _timeline = timelineData.filter(({id: _id}) => _id === id)
          if (_timeline.length === 0) {
            return timelineData
          }
          const timeline = _timeline.shift()
          timeline.actions = timeline.actions.concat(
            data
              .filter((line) => line.type === 1)
              .map((line) => {
                return {
                  id: `${id}_${line.begin}`,
                  start: line.begin,
                  end: line.end,
                  effectId: '',
                  text: line.text,
                }
              }),
          ).sort((a, b) => a.start - b.start)
          return timelineData.slice()
        })
        // setLatestTranscript(data as {type: number; begin: number; end: number; text: string })
      })

      window.electronAPI.getConfig('mainHorizontalGridRatio').then((value: [number, number]) => {
        if (value) {
          setMainHorizontalGridRatio(value)
          mainHorizontalGrid.current.setLayout(value)
        }
      })
      window.electronAPI.getConfig('mainVerticalGridRatio').then((value: [number, number]) => {
        if (value) {
          setMainVerticalGridRatio(value)
          mainVerticalGrid.current.setLayout(value)
        }
      })
      window.electronAPI.getConfig('sideVerticalGridRatio').then((value: [number, number]) => {
        if (value) {
          setSideVerticalGridRatio(value)
          sideVerticalGrid.current.setLayout(value)
        }
      })

      const _engine = new VideoEngine(videoTag)
      _engine.on('setTimeByTick', ({time}: { time: number }) => {
        // setTime(time);
        if (_autoScroll.current) {
          const autoScrollFrom = timelineState.current.target.clientWidth * 0.75
          const left = time * (SCALE_WIDTH / _scale.current) + START_LEFT - autoScrollFrom
          timelineState.current.setScrollLeft(left)
        }
      })
      setEngine(_engine)
    }
  }, [])

  return (
    <div
      className="App"
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={onFileDrop}
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        style={{marginBottom: 0}}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="sm"
          onClick={onClickMediaOpen}
        >
          <IconFolderOpen size={16} stroke={1.5}/>
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          radius="sm"
          disabled={timelineData.length === 0}
          onClick={() => {
            engine.pause()
            openExportDialog()
          }}
        >
          <IconBadgeCc size={16} stroke={1.5}/>
        </ActionIcon>
      </Group>
      <PanelGroup
        direction="horizontal"
        id="mainHorizontalGrid"
        onLayout={onResizeMainHorizontalGrid}
        ref={mainHorizontalGrid}
      >
        <Panel order={1}>
          <PanelGroup
            direction="vertical"
            id="mainVerticalGrid"
            onLayout={onResizeMainVerticalGrid}
            ref={mainVerticalGrid}
          >
            <Panel order={1}>
              <Stack
                justify="space-between"
                gap={0}
                style={{height: '100%'}}
              >
                <div
                  className="video-panel"
                  style={{flexGrow: 1}}
                >
                  <div className="player-wrapper">
                    <video
                      style={{width: audioOnly ? 0 : '100%'}}
                      className="preview-player"
                      disablePictureInPicture
                      preload="auto"
                      ref={videoTag}
                      onTimeUpdate={onTimeUpdate}
                      onPause={() => setIsPaused(true)}
                      onPlay={() => setIsPaused(false)}
                    >
                    </video>
                    {
                      audioOnly ?
                        <IconMovieOff size={160} stroke={0.5} style={{opacity: 0.3}}/> :
                        <></>
                    }
                  </div>
                  <MediaInfo mediaInfo={mediaInfo} style={{position: 'absolute', top: 0, right: 0, cursor: 'help'}}/>
                </div>

                <Divider/>
                <div className="timeSlider">
                  <Group justify="flex-end" wrap="nowrap">
                    <TimeStampInput
                      variant="invisible"
                      value={videoTag.current?.currentTime}
                      onChange={onTimeInput}
                      disabled={!mediaFilePath}
                      size="sm"
                      max={duration}
                      withMS={videoTag.current?.paused}
                      onFocus={() => engine.pause()}
                    />
                    <Text size="sm">/</Text>
                    <Text size="sm">{formatTime(duration, true)}</Text>
                  </Group>
                  <Slider
                    max={duration}
                    size="sm"
                    disabled={!mediaFilePath}
                    value={currentTime}
                    onChange={setTime}
                    label={(scale) => <>{formatTime(scale)}</>}
                  />
                </div>
                <Group gap="xs" justify="center">
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon.Group>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={!mediaFilePath}
                        size="lg"
                        radius="sm"
                        onClick={() => {
                          setTime(0)
                        }}
                      >
                        <IconPlayerSkipBack size={24} stroke={1.5}/>
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={!mediaFilePath}
                        size="lg"
                        radius="sm"
                        onClick={() => rawMedia(5)}
                      >
                        <IconRewindBackward5 size={24} stroke={1.5}/>
                      </ActionIcon>
                      {
                        isPaused ?
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={!mediaFilePath}
                            size="lg"
                            radius="sm"
                            onClick={playMedia}
                          >
                            <IconPlayerPlay size={24} stroke={1.5}/>
                          </ActionIcon> :
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={!mediaFilePath}
                            size="lg"
                            radius="sm"
                            onClick={pauseMedia}
                          >
                            <IconPlayerPause size={24} stroke={1.5}/>
                          </ActionIcon>
                      }
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={!mediaFilePath}
                        size="lg"
                        radius="sm"
                        onClick={() => ffMedia(10)}
                      >
                        <IconRewindForward10 size={24} stroke={1.5}/>
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        disabled={!mediaFilePath}
                        size="lg"
                        radius="sm"
                        onClick={() => {
                          engine.pause()
                          setTime(duration)
                        }}
                      >
                        <IconPlayerSkipForward size={24} stroke={1.5}/>
                      </ActionIcon>
                    </ActionIcon.Group>
                  </Group>
                  <Divider orientation="vertical"/>
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      disabled={!mediaFilePath}
                      size="sm"
                      radius="sm"
                      color="gray"
                      onClick={() => {
                        setSpeed(1)
                      }}
                      title="再生速度"
                    >
                      <IconClockPlay size={16} stroke={1.5}/>
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
                      label={(v) => <>再生速度: x{v}</>}
                    />
                  </Group>
                  <Divider orientation="vertical"/>
                  <Group gap="xs" wrap="nowrap">
                    <ActionIcon.Group>
                      <ActionIcon
                        variant="filled"
                        disabled={!mediaFilePath}
                        size="lg"
                        radius="sm"
                        onClick={() => {
                          engine.pause()
                          openTranscriptionDialog()
                        }}
                        title="自動文字起こし"
                      >
                        <IconFileTextAi size={24} stroke={1.5}/>
                      </ActionIcon>
                    </ActionIcon.Group>
                  </Group>
                </Group>
              </Stack>
            </Panel>
            <PanelResizeHandle hitAreaMargins={{coarse: 5, fine: 2}} className="resize-handle"/>
            <Panel order={2} defaultSize={30}>
              {
                mediaFilePath ?
                  <div className="timeline-panel">
                    <div
                      className="timeline-header"
                    >
                      <Group
                        gap="xs"
                        wrap="nowrap"
                        justify="center"
                        style={{height: '2.5625rem', flexShrink: 0}}
                      >
                        <ActionIcon
                          variant="default"
                          size="md"
                          radius="sm"
                          color="gray"
                          onClick={addEmptyTimeline}
                        >
                          <IconPlus size={16} stroke={1.5}/>
                        </ActionIcon>
                        <Group gap="xs" wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            disabled={!mediaFilePath || scaleLevel === 0}
                            size="sm"
                            radius="sm"
                            color="gray"
                            onClick={() => setScaleLevel((x) => Math.max(x - 1, 0))}
                          >
                            <IconZoomOut size={16} stroke={1.5}/>
                          </ActionIcon>
                          <Slider
                            disabled={!mediaFilePath}
                            value={scaleLevel}
                            onChange={setScaleLevel}
                            min={0}
                            max={scales.length - 1}
                            radius="md"
                            size="md"
                            step={1}
                            style={{width: '80px'}}
                            label={null}
                          />
                          <ActionIcon
                            variant="subtle"
                            disabled={!mediaFilePath || scaleLevel === scales.length - 1}
                            size="sm"
                            radius="sm"
                            color="gray"
                            onClick={() => setScaleLevel((x) => Math.min(x + 1, scales.length - 1))}
                          >
                            <IconZoomIn size={16} stroke={1.5}/>
                          </ActionIcon>
                        </Group>
                        <ActionIcon
                          variant={autoScroll ? 'filled' : 'default'}
                          size="md"
                          radius="sm"
                          className="mantine-active"
                          onClick={() => setAutoScroll(v => !v)}
                          title="再生時間に合わせて自動スクロール"
                        >
                          <IconArrowBigRightLines size={16} stroke={1.5}/>
                        </ActionIcon>
                      </Group>
                      <Divider/>
                      <SegmentedControl
                        orientation="vertical"
                        fullWidth
                        value={selectedRowId}
                        onChange={setSelectedRowId}
                        transitionDuration={0}
                        color="blue"
                        styles={{
                          root: {
                            paddingTop: 0,
                            paddingBottom: 0,
                            overflow: 'scroll',
                          },
                        }}
                        data={
                          timelineData.map((item: TranscriptionRow) => {
                            return {
                              value: item.id,
                              label: (
                                <Group justify="space-between" gap={0} align="center" wrap="nowrap" className="visible-on-hover-parent">
                                  <div
                                    style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                    title={item.name}
                                  >
                                    {item.name}
                                  </div>
                                  {
                                    processingTranscriptions[item.id] ?
                                      <Group wrap="nowrap" gap="xs">
                                        <div className="loader">
                                          <IconAbc className="abc" size={16} stroke={1.5}/>
                                          <IconPencil className="pencil" size={16} stroke={1.5}/>
                                          <IconRobot size={24} stroke={1}/>
                                        </div>
                                        <ActionIcon
                                          variant="outline"
                                          color="red"
                                          size="sm"
                                          radius="sm"
                                          title="自動文字起こしを中止"
                                        >
                                          <IconBan size={16} stroke={1.5}/>
                                        </ActionIcon>
                                      </Group> :
                                      <div className="visible-on-hover">
                                        <ActionIcon
                                          variant="outline"
                                          color="red"
                                          size="sm"
                                          radius="sm"
                                          title="削除"
                                          onClick={() => removeTimeline(item.id)}
                                        >
                                          <IconX size={16} stroke={1.5}/>
                                        </ActionIcon>
                                      </div>
                                    }
                                </Group>
                              ),
                            }
                          })
                        }
                        ref={timelineHeader}
                        onScroll={(e) => {
                          const target = e.target as HTMLDivElement
                          timelineState.current.setScrollTop(target.scrollTop)
                        }}
                      />
                    </div>
                    <div style={{width: '100%'}}>
                      <Timeline
                        ref={timelineState}
                        editorData={timelineData}
                        engine={engine}
                        onChange={() => updateTimelineData()}
                        effects={{}}
                        scaleSplitCount={10}
                        minScaleCount={Math.ceil(Math.max(duration, 1) / scale)}
                        scaleWidth={SCALE_WIDTH}
                        scale={scale}
                        startLeft={START_LEFT}
                        getScaleRender={(scale) => <>{formatTime(scale)}</>}
                        autoScroll={true}
                        dragLine={true}
                        onScroll={({scrollTop}) => {
                          if (timelineHeader.current) {
                            timelineHeader.current.scrollTop = scrollTop
                          }
                        }}
                        onDoubleClickRow={(e, {row, time}) => {
                          // アクション上でダブルクリックされた場合
                          if ((e.target as HTMLDivElement).closest('.timeline-editor-action')) {
                            return
                          }
                          row.actions = [
                            ...row.actions,
                            {
                              id: `${row.id}_${new Date().getTime()}`,
                              start: time,
                              end: time + 1,
                              effectId: null,
                            },
                          ].sort((a, b) => a.start - b.start)
                          updateTimelineData()
                        }}
                        // onClickActionOnly={(e, {row, action}) => {
                        // }}
                        onDoubleClickAction={(e, {action}: {
                          row: TranscriptionRow,
                          action: TranscriptionText,
                          time: number
                        }) => {
                          setActiveTextId(action.id)
                        }}
                        onActionMoveEnd={updateTimelineData}
                        onActionResizeEnd={updateTimelineData}
                        getActionRender={(action: TranscriptionText) => {
                          return <div className="prompt">{action.text}</div>
                        }}
                      />
                    </div>
                  </div> :
                  <></>
              }
            </Panel>
          </PanelGroup>
        </Panel>
        <PanelResizeHandle hitAreaMargins={{coarse: 5, fine: 2}} className="resize-handle"/>
        <Panel order={2} defaultSize={30}>
          <PanelGroup
            direction="vertical"
            id="sideVerticalGrid"
            onLayout={onResizeSideVerticalGrid}
            ref={sideVerticalGrid}
          >
            <Panel order={1} defaultSize={50} style={{position: 'relative'}}>
              <div
                ref={sideTop}
                style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 0}}
              >
                {
                  selectedRow ?
                    <TimelineTable
                      timeline={selectedRow}
                      currentTextId={currentTextId}
                      parentHeight={sideTop.current.clientHeight}
                      parentWidth={sideTop.current.scrollWidth}
                      onClick={(text) => {
                        setActiveTextId(text.id)
                      }}
                      onSetTime={(time) => {
                        setTime(time)
                        playMedia()
                      }}
                      onChange={updateTimelineData}
                    /> :
                    <></>
                }
              </div>
            </Panel>
            <PanelResizeHandle hitAreaMargins={{coarse: 5, fine: 2}} className="resize-handle"/>
            <Panel order={2}>
              {
                activeText ?
                  <TextEditArea
                    text={activeText}
                    onChange={updateTimelineData}
                    onRemove={removeActiveText}
                  /> :
                  <></>
              }
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
      <TranscriptionModal
        opened={isOpenedTranscriptionDialog}
        onClose={closeTranscriptionDialog}
        mediaFilePath={mediaFilePath}
        duration={duration}
        onClickStartTranscription={onClickStartTranscription}
        isAppleSilicon={isAppleSilicon}
      />
      <OutputModal
        timelineData={timelineData}
        selectedRowId={selectedRowId}
        opened={isOpenedExportDialog}
        onClose={closeExportDialog}
      />
    </div>
  )
}

export default App
