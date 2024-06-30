import React, { useEffect, useRef, useState } from 'react'
import {
  Button,
  Divider,
  Group,
  Input,
  Modal,
  RangeSlider,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@mantine/core'
import { LANGUAGES } from '../const'
import { TranscriptionParams } from '../declare'
import TimeStampInput from './timeStampInput'
import { IconPlayerPlayFilled } from '@tabler/icons-react'

const languages = LANGUAGES.map(([label, code]) => {
  return {label, value: code}
})
const languageLabels = LANGUAGES.reduce((obj: { [key: string]: string }, [label, code]: [string, string]) => {
  return Object.assign(obj, {[code]: label.replace(/\s*\(.+?\)$/, '')})
}, {})
const models = [
  {label: 'Base', value: 'base'},
  {label: 'Base(英語専用)', value: 'base.en'},
  {label: 'Medium', value: 'medium'},
  {label: 'Medium(英語専用)', value: 'medium.en'},
  {label: 'Large-v2', value: 'large-v2'},
  {label: 'Large-v3', value: 'large-v3'},
]
const modelLabels = models.reduce((obj: { [key: string]: string }, x) => {
  return Object.assign(obj, {[x.value]: x.label})
}, {})

const computeTypes = [
  {label: '自動 (推奨)', value: 'auto'},
  {label: 'int8', value: 'int8'},
  {label: 'int8_float32', value: 'int8_float32'},
  {label: 'int8_float16', value: 'int8_float16'},
  {label: 'int8_bfloat16', value: 'int8_bfloat16'},
  {label: 'int16', value: 'int16'},
  {label: 'float16', value: 'float16'},
  {label: 'float32', value: 'float32'},
  {label: 'bfloat16', value: 'bfloat16'},
]

interface Props {
  opened: boolean
  onClose: () => unknown
  mediaFilePath: string
  duration: number
  onClickStartTranscription?: (id: string, promise: Promise<unknown>, name: string) => unknown
  isAppleSilicon: boolean
}

function TranscriptionModal({
                              opened,
                              onClose,
                              mediaFilePath,
                              duration,
                              onClickStartTranscription,
                              isAppleSilicon,
                            }: Props) {
  const videoTag = useRef<HTMLVideoElement>(null)
  const [timeRange, setTimeRange] = useState<[number, number]>([0, duration])
  const [language, setLanguage] = useState<string>(navigator.language.split('-')[0])
  const [model, setModel] = useState<string>('medium')
  const [computeType, setComputeType] = useState<string>('auto')
  const [initialPrompt, setInitialPrompt] = useState<string>('')

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
    const args: TranscriptionParams = {
      filePath: mediaFilePath,
      language,
      model,
      id,
      initialPrompt
    }
    if (timeRange[0]) {
      args.start = timeRange[0]
    }
    if (timeRange[1] !== duration) {
      args.end = timeRange[1]
    }
    if (!isAppleSilicon) {
      args.computeType = computeType
    }

    const promise = window.electronAPI.startTranscription(args)
    const name = `自動文字起こし(${languageLabels[language]} ${modelLabels[model]})`
    onClickStartTranscription && onClickStartTranscription(id, promise, name)
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
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      overlayProps={{blur: 1}}
    >
      <form>
        <Stack>
          <video
            className="preview-player"
            disablePictureInPicture
            preload="auto"
            ref={videoTag}
            src={`file://${encodeURIComponent(mediaFilePath).replaceAll('%2F', '/').replaceAll('%5C', '\\').replaceAll('%3A', ':')}`}
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
          <Divider/>
          <Group>
            <Text fw="bold" size="sm">高度な設定</Text>
          </Group>
          <Group wrap="nowrap" align="flex-end">
            <Textarea
              label="出力イメージ・用語辞書"
              description="句読点の有無、大文字小文字、漢字の字形など、出力結果のイメージを指定します。また、固有名詞や専門用語、特定の漢字をひらくかどうかなど、音声認識の結果をある程度誘導することもできます"
              id="initialprompt"
              value={initialPrompt}
              onInput={(v) => setInitialPrompt(v.currentTarget.value)}
              size="sm"
              radius="sm"
            />
          </Group>
          {
            isAppleSilicon ?
              <></> :
              <>
                <Group wrap="nowrap" align="flex-end">
                  <Select
                    label="量子化タイプ"
                    id="computetype"
                    data={computeTypes}
                    value={computeType}
                    onChange={(v) => setComputeType(v)}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                </Group>
              </>
          }
        </Stack>
      </form>
    </Modal>
  )
}

export default TranscriptionModal
