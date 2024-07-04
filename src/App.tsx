import { DragEvent, useEffect, useRef, useState } from 'react'
import { ImperativePanelGroupHandle, Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useDisclosure } from '@mantine/hooks'
import {
  ActionIcon,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  noop,
  Popover,
  SegmentedControl,
  Slider,
  Stack,
  Text,
} from '@mantine/core'
import TimeStampInput from './components/timeStampInput'
import {
  IconAbc,
  IconArrowBigRightLines,
  IconBadgeCc,
  IconChevronDown,
  IconClockPlay,
  IconDeviceFloppy,
  IconFileMusic,
  IconFileTextAi,
  IconFolderOpen,
  IconListCheck,
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
  IconVolume,
  IconVolume2,
  IconVolume3,
  IconX,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react'
import TranscriptionModal from './components/transcriptionModal'
import TaskQueueTable from './components/taskQueueTable'
import VideoEngine from './components/timelineEngine'
import SequenceTable from './components/sequenceTable'
import TextEditArea from './components/textEditArea'
import { Timeline, TimelineEngine, TimelineState } from 'react-timeline-editor'
import { FfmpegMediaInfo } from './features/file'
import { formatTime } from './utils'
import { TranscriptionParams, TranscriptionSequence, TranscriptionTask, TranscriptionText } from './declare'
import './App.css'
import MediaInfo from './components/mediaInfo'
import OutputModal from './components/outputModal'
import { saveProjectFile } from './features/output'
import WelcomePage from './components/welcomePage'

const START_LEFT = 30
const SCALE_WIDTH = 160

function App() {
  const [isAppleSilicon, setIsAppleSilicon] = useState<boolean>(false)
  const videoTag = useRef<HTMLVideoElement>(null)
  const timelineHeader = useRef<HTMLDivElement>(null)
  const timelineState = useRef<TimelineState>(null)
  const [projectFilePath, setProjectFilePath] = useState<string>(null)
  const [mediaFilePath, setMediaFilePath] = useState<string>(null)
  const [mediaInfo, setMediaInfo] = useState<FfmpegMediaInfo>(null)
  const [audioOnly, setAudioOnly] = useState<boolean>(false)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPaused, setIsPaused] = useState<boolean>(true)
  const [speed, setSpeed] = useState<number>(1.0)
  const [volume, setVolume] = useState<number>(1.0)
  const [muted, setMuted] = useState<boolean>(false)
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
  const [isOpenedLoader, {
    open: openLoader,
    close: closeLoader,
  }] = useDisclosure(false)
  const [sequenceData, setSequenceData] = useState<TranscriptionSequence[]>([])
  const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null)
  const [selectedSequence, setSelectedSequence] = useState<TranscriptionSequence>(null)
  // const [selectedTextList, setSelectedTextList] = useState<TranscriptionText[]>([])
  const [activeTextId, setActiveTextId] = useState<string>(null)
  const [activeText, setActiveText] = useState<TranscriptionText>(null)
  const [currentTextId, setCurrentTextId] = useState<string>(null)

  const [engine, setEngine] = useState<TimelineEngine>(null)
  const [scales, setScales] = useState<number[]>([])
  const [scaleLevel, setScaleLevel] = useState(0)
  const [scale, setScale] = useState(1)
  const _scale = useRef(scale)
  const [transcriptionTaskQueue, setTranscriptionTaskQueue] = useState<TranscriptionTask[]>([])
  const [processingTranscriptions, setProcessingTranscriptions] = useState<string[]>([])

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
    window.electronAPI.contentStatus({
      mediaFilePath,
      projectFilePath,
    })
  }, [mediaFilePath, projectFilePath])

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
    sequenceData.map((sequence) => {
      if (sequence.id == selectedSequenceId) {
        setSelectedSequence(sequence)
        found = true
      }
    })
    if (!found) {
      setSelectedSequence(null)
    }
    _scale.current = scale
  }, [selectedSequenceId, sequenceData])

  useEffect(() => {
    for (let i = 0; i < sequenceData.length; i++) {
      const _sequence = sequenceData[i]
      for (let l = 0; l < _sequence.actions.length; l++) {
        const text = _sequence.actions[l]
        if (activeTextId == text.id) {
          setActiveText(text)
          return
        }
      }
    }
    setActiveText(null)
  }, [sequenceData, activeTextId])

  const execNextTask = (queue: TranscriptionTask[]) => {
    // 最初のタスクを実行
    for (let i = 0; i < queue.length; i++) {
      const _task = queue[i]
      if (_task.status === 0) {
        _task.promise = window.electronAPI.startTranscription(_task.params)
        // タスクが完了したら次のタスクを実行
        _task.promise.then((status: number) => {
          // status 0: success 1: error
          _task.status = status ? 3 : 2
        }).then(() => {
          setTranscriptionTaskQueue((_queue: TranscriptionTask[]) => {
            execNextTask(_queue)
            return _queue.slice()
          })
        })
        _task.status = 1
        break
      }
    }
  }

  // タスクキュー
  useEffect(() => {
    // 実行中のタスクが存在していたら何もしない
    if (transcriptionTaskQueue.some((task) => task.status === 1)) {
      return
    }
    execNextTask(transcriptionTaskQueue)
  }, [transcriptionTaskQueue.length])

  useEffect(() => {
    setProcessingTranscriptions(
      transcriptionTaskQueue
        .filter((task) => task.status === 1)
        .map((task) => task.params.id)
    )
  }, [transcriptionTaskQueue])

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

  const _cleanup = () => {
    pauseMedia()
    setIsPaused(true)
    setTime(0)
    engine?.setTime(0)
    timelineState.current?.setTime(0)
    timelineState.current?.setScrollLeft(0)
    setSequenceData([])
    setActiveTextId(null)
    setSelectedSequenceId(null)
    setProjectFilePath(null)
    videoTag.current.src = null
  }

  const openMedia = async (filePath: string, force = false) => {
    const _mediaInfo = await window.electronAPI.getMediaInfo(filePath)
    if (!_mediaInfo) {
      alert('この形式のファイルには対応していません')
      return
    }

    // 初期化
    if (!force && mediaFilePath && !confirm('現在編集中のファイルを閉じてもよろしいですか?')) {
      return
    }
    _cleanup()

    setMediaInfo(_mediaInfo)
    setDuration(_mediaInfo.duration / 1000)
    setMediaFilePath(filePath)
    videoTag.current.src = 'file://' + encodeURIComponent(filePath).replaceAll('%2F', '/').replaceAll('%5C', '\\').replaceAll('%3A', ':')
  }

  const openProject = async (filePath: string) => {
    const _projectData = await window.electronAPI.loadProjectFile(filePath)
    if (!_projectData) {
      alert('プロジェクトファイルを開けませんでした')
      return
    }
    // 初期化
    if (mediaFilePath && !confirm('現在編集中のファイルを閉じてもよろしいですか?')) {
      return
    }

    openLoader()
    _cleanup()

    await openMedia(_projectData.media, true)
    setProjectFilePath(filePath)
    closeLoader()
    setSequenceData(_projectData.sequenceData)
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

    if (selectedSequence) {
      for (let i = 0; i < selectedSequence.actions.length; i++) {
        if (selectedSequence.actions[i].start <= currentTime && currentTime <= selectedSequence.actions[i].end) {
          setCurrentTextId(selectedSequence.actions[i].id)
          return
        } else if (currentTime <= selectedSequence.actions[i].start) {
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

    setSequenceData((_sequenceData) => {
      _sequenceData.forEach((_sequence) => {
        _sequence.actions = _sequence.actions.filter((text) => {
          return activeTextId !== text.id
        })
      })
      return structuredClone(_sequenceData)
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

  const onClickProjectOpen = () => {
    window.electronAPI.openProjectFile().then((projectFile) => {
      if (projectFile) {
        openProject(projectFile).then()
      }
    })
  }

  const projectSaveAsName = () => {
    window.electronAPI.saveProjectFile().then((dest) => {
      if (dest) {
        setProjectFilePath(dest)
        saveProjectFile(dest, mediaFilePath, sequenceData)
      }
    })
  }

  const projectOverwrite = () => {
    saveProjectFile(projectFilePath, mediaFilePath, sequenceData)
  }
  const onClickProjectSave = () => {
    if (projectFilePath) {
      projectOverwrite()
    } else {
      projectSaveAsName()
    }
  }

  const onClickEnqueue = (params: TranscriptionParams) => {
    const task: TranscriptionTask = {
      status: 0,
      promise: null,
      params,
    }
    setTranscriptionTaskQueue((queue) => {
      queue.push(task)
      return queue.slice()
    })
  }

  const addNewSequence = (name: string) => {
    const id = new Date().getTime().toString()
    setSequenceData((_sequenceData) => {
      _sequenceData = _sequenceData.concat([{
        id,
        name,
        actions: [],
      } as TranscriptionSequence])
      return structuredClone(_sequenceData)
    })
    return id
  }

  const addEmptySequence = () => {
    setSequenceData((_sequenceData) => {
      const sequenceNames = _sequenceData.map((_sequence) => _sequence.name)
      let name = ''
      let suffix = 0
      do {
        name = `無題のシーケンス${suffix ? ` (${suffix})` : ''}`
        suffix++
      } while (sequenceNames.includes(name))
      _sequenceData = _sequenceData.concat([{
        id: new Date().getTime().toString(),
        name: name,
        actions: [],
      } as TranscriptionSequence])
      return structuredClone(_sequenceData)
    })
  }

  const removeSequence = (id: string) => {

    setSequenceData((_sequenceData) => {
      return structuredClone(_sequenceData.filter((_sequence) => _sequence.id !== id))
    })
  }

  useEffect(() => {
    videoTag.current.playbackRate = speed
  }, [speed])
  useEffect(() => {
    videoTag.current.volume = volume
  }, [volume])
  useEffect(() => {
    videoTag.current.muted = muted
  }, [muted])

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

  const updateSequenceData = () => {
    setSequenceData((c) => structuredClone(c))
  }

  useEffect(() => {
    window.electronAPI.isAppleSilicon().then((_isAppleSilicon) => {
      setIsAppleSilicon(_isAppleSilicon)
    })

    if (!engine) {
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

      // メニューから開かれた場合
      window.electronAPI.onOpenMedia(openMedia)
      window.electronAPI.onOpenProjectFile(openProject)
      window.electronAPI.onSaveProjectFile((dest) => {
        saveProjectFile(dest, mediaFilePath, sequenceData)
      })
      window.electronAPI.onShowTranscriptionDialog(() => {
        _engine.pause()
        openTranscriptionDialog()
      })

      window.electronAPI.onTranscriptionProgress(({id, data}) => {
        setSequenceData((sequenceData) => {
          const _sequence = sequenceData.filter(({id: _id}) => _id === id)
          if (_sequence.length === 0) {
            return sequenceData
          }
          const sequence = _sequence.shift()
          sequence.actions = sequence.actions.concat(
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
          return sequenceData.slice()
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
    }

    window.electronAPI.contentReady()
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
        <Group gap="xs">
          <Group gap={0}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="sm"
              onClick={onClickMediaOpen}
              title="メディアファイルを開く"
            >
              <IconFileMusic size={24} stroke={1.5}/>
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="sm"
              onClick={onClickProjectOpen}
              title="プロジェクトファイルを開く"
            >
              <IconFolderOpen size={24} stroke={1.5}/>
            </ActionIcon>
          </Group>
          <Divider orientation="vertical"/>
          <ActionIcon.Group style={{alignItems: 'center'}}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              radius="sm"
              disabled={!mediaFilePath}
              onClick={onClickProjectSave}
              title="プロジェクトファイルを保存する"
            >
              <IconDeviceFloppy size={24} stroke={1.5}/>
            </ActionIcon>
            <Menu
              position="bottom-end"
              disabled={!mediaFilePath || !projectFilePath}
              offset={0}
            >
              <Menu.Target>
                <ActionIcon
                  style={{height: '34px'}}
                  variant="subtle"
                  color="gray"
                  size="xs"
                  radius="sm"
                  disabled={!mediaFilePath || !projectFilePath}
                >
                  <IconChevronDown size={16} stroke={1}/>
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={projectSaveAsName}>プロジェクトファイルを別名で保存...</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </ActionIcon.Group>
        </Group>
        <ActionIcon
          size="lg"
          radius="sm"
          disabled={sequenceData.length === 0}
          onClick={() => {
            engine.pause()
            openExportDialog()
          }}
        >
          <IconBadgeCc size={24} stroke={1.5}/>
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
                    <ActionIcon
                      variant={muted ? 'outline' : 'subtle'}
                      disabled={!mediaFilePath}
                      size="sm"
                      radius="sm"
                      color={muted ? 'red' : 'gray'}
                      onClick={() => setMuted((v) => !v)}
                      title="音量"
                    >
                      {
                        muted || volume === 0 ?
                          <IconVolume3 size={16} stroke={1.5}/> :
                          volume <= 0.5 ?
                            <IconVolume2 size={16} stroke={1.5}/> :
                            <IconVolume size={16} stroke={1.5}/>
                      }
                    </ActionIcon>
                    <Slider
                      disabled={!mediaFilePath || muted}
                      value={volume}
                      onChange={setVolume}
                      min={0}
                      max={1}
                      radius="md"
                      size="md"
                      step={0.1}
                      style={{width: '80px'}}
                      label={null}
                    />
                  </Group>
                </Group>
              </Stack>
            </Panel>
            <PanelResizeHandle hitAreaMargins={{coarse: 5, fine: 2}} className="resize-handle"/>
            <Panel order={2} defaultSize={30}>
              {
                mediaFilePath ?
                  <Stack style={{height: '100%'}} gap={0} justify="space-between">
                    <div className="timeline-panel">
                      <div
                        className="timeline-header"
                      >
                        <Group
                          pl="xs"
                          pr="xs"
                          gap="xs"
                          wrap="nowrap"
                          justify="space-between"
                          style={{height: '2.5625rem', flexShrink: 0}}
                        >
                          <ActionIcon
                            variant="default"
                            size="md"
                            radius="sm"
                            color="gray"
                            onClick={addEmptySequence}
                            title="空のシーケンスを追加"
                          >
                            <IconPlus size={16} stroke={1.5}/>
                          </ActionIcon>
                          <Group gap={0}>
                            {
                              processingTranscriptions.length ?
                                <div className="loader">
                                  <IconAbc className="abc" size={16} stroke={1.5}/>
                                  <IconPencil className="pencil" size={16} stroke={1.5}/>
                                  <IconRobot size={24} stroke={1}/>
                                </div> :
                                <></>
                            }
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
                              <Popover
                                width="auto"
                                position="top"
                                offset={0}
                                withArrow
                                disabled={transcriptionTaskQueue.length === 0}
                              >
                                <Popover.Target>
                                  <ActionIcon
                                    variant="outline"
                                    disabled={transcriptionTaskQueue.length === 0}
                                    size="lg"
                                    radius="sm"
                                    title="タスクキュー"
                                  >
                                    <IconListCheck size={24} stroke={1.5}/>
                                  </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown p={0} style={{overflowY: 'auto'}}>
                                  <TaskQueueTable
                                    queue={transcriptionTaskQueue}
                                    onUpdated={(queue) => setTranscriptionTaskQueue(queue.slice())}
                                  />
                                </Popover.Dropdown>
                              </Popover>
                            </ActionIcon.Group>
                          </Group>
                        </Group>
                        <Divider/>
                        <SegmentedControl
                          orientation="vertical"
                          fullWidth
                          value={selectedSequenceId}
                          onChange={setSelectedSequenceId}
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
                            sequenceData.map((item: TranscriptionSequence) => {
                              return {
                                value: item.id,
                                label: (
                                  <Group justify="space-between" gap={0} align="center" wrap="nowrap"
                                         className="visible-on-hover-parent">
                                    <div
                                      style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
                                      title={item.name}
                                    >
                                      {item.name}
                                    </div>
                                    {
                                      processingTranscriptions.includes(item.id) ?
                                        <></> :
                                        <div className="visible-on-hover">
                                          <ActionIcon
                                            variant="outline"
                                            color="red"
                                            size="sm"
                                            radius="sm"
                                            title="削除"
                                            onClick={() => removeSequence(item.id)}
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
                          editorData={sequenceData}
                          engine={engine}
                          onChange={() => updateSequenceData()}
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
                            updateSequenceData()
                          }}
                          // onClickActionOnly={(e, {row, action}) => {
                          // }}
                          onDoubleClickAction={(e, {action}: {
                            row: TranscriptionSequence,
                            action: TranscriptionText,
                            time: number
                          }) => {
                            setActiveTextId(action.id)
                          }}
                          onActionMoveEnd={updateSequenceData}
                          onActionResizeEnd={updateSequenceData}
                          getActionRender={(action: TranscriptionText) => {
                            return <div className="prompt">{action.text}</div>
                          }}
                        />
                      </div>
                    </div>
                    <Group style={{height: '2.125rem', flexShrink: 0}} gap={0} grow={false} align="center">
                      <Group style={{width: '15rem', flexShrink: 0}}>
                      </Group>
                      <Divider orientation="vertical"/>
                      <Group pl="xs" pr="xs" gap="xs" style={{flexGrow: 1}} justify="space-between" wrap="nowrap">
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
                    </Group>
                  </Stack>
                  :
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
                  selectedSequence ?
                    <SequenceTable
                      sequence={selectedSequence}
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
                      onChange={updateSequenceData}
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
                    onChange={updateSequenceData}
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
        sequenceData={sequenceData}
        selectedSequenceId={selectedSequenceId}
        onAddNewSequence={addNewSequence}
        onClickEnqueue={onClickEnqueue}
        isAppleSilicon={isAppleSilicon}
      />
      <OutputModal
        sequenceData={sequenceData}
        selectedSequenceId={selectedSequenceId}
        opened={isOpenedExportDialog}
        onClose={closeExportDialog}
      />
      <Modal
        opened={isOpenedLoader}
        onClose={noop}
        closeOnClickOutside={false}
        withCloseButton={false}
        closeOnEscape={false}
        size="auto"
        overlayProps={{blur: 1}}
      >
        <Group justify="center" gap="xs" wrap="nowrap">
          <Loader size="sm"/>
          <Text size="sm">プロジェクトファイルを開いています しばらくお待ちください…</Text>
        </Group>
      </Modal>
      <WelcomePage opened={!mediaFilePath} onClickMediaOpen={onClickMediaOpen} onClickProjectOpen={onClickProjectOpen}/>
    </div>
  )
}

export default App
