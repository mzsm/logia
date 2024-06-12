import React, { useEffect, useRef, useState } from 'react'
import { Button, Group, Input, Modal, RangeSlider, ScrollArea, Select, SimpleGrid, Stack } from '@mantine/core'
import { LANGUAGES } from '../const'
import TimeStampInput from './timeStampInput'
import { IconPlayerPlayFilled } from '@tabler/icons-react'

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

interface Props {
  opened: boolean
  onClose: () => unknown
  mediaFilePath: string
  duration: number
  onClickStartTranscription?: (id: string, promise: Promise<unknown>) => unknown
}

function TranscriptionModal({opened, onClose, mediaFilePath, duration, onClickStartTranscription}: Props) {
  const videoTag = useRef<HTMLVideoElement>(null)
  const [timeRange, setTimeRange] = useState<[number, number]>([0, duration])
  const [language, setLanguage] = useState<string>(navigator.language.split('-')[0])
  const [model, setModel] = useState<string>('medium')

  const onChangeRangeSlider = (value: [number, number]) => {
    setTimeRange((prevValue) => {
      if (prevValue[0] !== value[0]) {
        videoTag.current.currentTime = value[0]
      } else if (prevValue[1] !== value[1]) {
        videoTag.current.currentTime = value[1]
      }
      return value
    })
  }

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

  const _onClickStartTranscription = () => {
    const id = new Date().getTime().toString()
    // 書き起こしを実行し、Promiseを変数に代入
    const args: { filePath: string; id: string; language?: string; model?: string; start?: number; end?: number } = {
      filePath: mediaFilePath,
      language,
      model,
      id,
    }
    if (timeRange[0]) {
      args.start = timeRange[0]
    }
    if (timeRange[1] !== duration) {
      args.end = timeRange[1]
    }

    const promise = window.electronAPI.startTranscription(args)
    onClickStartTranscription && onClickStartTranscription(id, promise)
    onClose()
  }

  useEffect(() => {
    window.electronAPI.getConfig('language').then((value: string) => {
      setLanguage(value)
    })
    window.electronAPI.getConfig('model').then((value: string) => {
      setModel(value)
    })
  }, [])


  useEffect(() => {
    setTimeRange([0, duration])
  }, [duration])

  return (
    <Modal
      title="自動文字起こし"
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={false}
      size={'lg'}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <form>
        <Stack>
          <video
            className="preview-player"
            disablePictureInPicture
            preload="auto"
            ref={videoTag}
            src={`file://${mediaFilePath}`}
          >
          </video>
          <Input.Wrapper
            label="対象範囲"
          >
            <RangeSlider
              value={timeRange}
              max={duration}
              size="xs"
              onChange={onChangeRangeSlider}
              step={0.001}
              label={null}
            />
            <Group justify="space-between">
              <TimeStampInput
                value={timeRange[0]}
                max={duration}
                onChange={(val) => onChangeRangeSlider([val, Math.max(val, timeRange[1])])}
              />
              <TimeStampInput
                value={timeRange[1]}
                max={duration}
                onChange={(val) => onChangeRangeSlider([Math.min(timeRange[0], val), val])}
              />
            </Group>
          </Input.Wrapper>
          <SimpleGrid cols={2}>
            <Select
              label="言語"
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
            <Select
              label="モデル"
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
          </SimpleGrid>
          <Group justify="right">
            <Button
              radius="sm"
              onClick={_onClickStartTranscription}
              leftSection={<IconPlayerPlayFilled size={16} stroke={1.5}/>}
            >
              自動文字起こしを開始
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

export default TranscriptionModal
