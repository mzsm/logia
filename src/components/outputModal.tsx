import React, { useEffect, useRef, useState } from 'react'
import { Button, Checkbox, Divider, Group, Modal, ScrollArea, Select, Stack, Text } from '@mantine/core'
import {
  ENCODING_CP932,
  ENCODING_UTF16LE,
  ENCODING_UTF8, ENCODING_UTF8_BOM,
  OUTPUT_FORMAT_TYPES,
  OUTPUT_FORMATS,
  TEXT_ENCODINGS,
} from '../const'
import { TranscriptionRow } from '../declare'
import { exportCCFile, TextOptions, CsvOptions } from '../features/output'

const formats: { label: string, value: OUTPUT_FORMAT_TYPES }[] = OUTPUT_FORMATS.map(([value, label]) => {
  return {label, value}
})

const CSV_PRESET_COMMA_UTF8 = 'comma_utf8'
const CSV_PRESET_TAB_UTF16LE = 'tab_utf16le'
const CSV_PRESET_COMMA_CP932 = 'comma_cp932'
const CSV_PRESET_CUSTOM = 'custom'
type CSV_PRESET_TYPES =
  | typeof CSV_PRESET_COMMA_UTF8
  | typeof CSV_PRESET_TAB_UTF16LE
  | typeof CSV_PRESET_COMMA_CP932
  | typeof CSV_PRESET_CUSTOM
const CSV_SEPARATOR_COMMA = ','
const CSV_SEPARATOR_TAB = '\t'
type CSV_SEPARATOR_TYPES = typeof CSV_SEPARATOR_COMMA | typeof CSV_SEPARATOR_TAB
const TIMESTAMP_FORMAT_TIMECODE = 'timecode'
const TIMESTAMP_FORMAT_SEC = 'sec'
const TIMESTAMP_FORMAT_MS = 'ms'

const csvPresets: Partial<Record<CSV_PRESET_TYPES, [CSV_SEPARATOR_TYPES, string]>> = {
  [CSV_PRESET_COMMA_UTF8]: [CSV_SEPARATOR_COMMA, ENCODING_UTF8_BOM],
  [CSV_PRESET_TAB_UTF16LE]: [CSV_SEPARATOR_TAB, ENCODING_UTF16LE],
  [CSV_PRESET_COMMA_CP932]: [CSV_SEPARATOR_COMMA, ENCODING_CP932],
}
const csvFormats: { label: string, value: CSV_PRESET_TYPES }[] = [
  {label: 'カンマ区切り UTF-8(BOM)', value: CSV_PRESET_COMMA_UTF8},
  {label: 'タブ区切り UTF-16LE', value: CSV_PRESET_TAB_UTF16LE},
  {label: 'カンマ区切り Shift_JIS', value: CSV_PRESET_COMMA_CP932},
  {label: 'カスタム', value: CSV_PRESET_CUSTOM},
]
const csvSeparators = [
  {label: 'カンマ (,)', value: CSV_SEPARATOR_COMMA},
  {label: 'タブ (\\t)', value: CSV_SEPARATOR_TAB},
]
const csvTimestampFormats = [
  {label: 'タイムコード(時:分:秒.ミリ秒)', value: TIMESTAMP_FORMAT_TIMECODE},
  {label: '秒単位', value: TIMESTAMP_FORMAT_SEC},
  {label: 'ミリ秒単位', value: TIMESTAMP_FORMAT_MS},
]

const newlines = [
  {label: 'CRLF (Windows)', value: '\r\n'},
  {label: 'LF (Linux, macOS)', value: '\n'},
]

interface Props {
  timelineData: TranscriptionRow[]
  selectedRowId: string,
  opened: boolean
  onClose: () => unknown
}

function OutputModal({timelineData, selectedRowId, opened, onClose}: Props) {
  const [timelines, setTimelines] = useState([])
  const [target, setTarget] = useState<string>(null)
  const _target = useRef<TranscriptionRow>(null)
  const [outputFormat, setOutputFormat] = useState<OUTPUT_FORMAT_TYPES>(formats[0].value)
  // settings for CSV
  const [csvFormat, setCsvFormat] = useState<CSV_PRESET_TYPES>(csvFormats[0].value)
  const [csvSeparator, setCsvSeparator] = useState<CSV_SEPARATOR_TYPES>(CSV_SEPARATOR_COMMA)
  const [csvEncoding, setCsvEncoding] = useState<string>(ENCODING_UTF8)
  const [csvTimestampFormat, setCsvTimestampFormat] = useState<string>(TIMESTAMP_FORMAT_TIMECODE)
  const [csvOmitEndTimestamps, setCsvOmitEndTimestamps] = useState<boolean>(false)
  const [csvInsertHeader, setCsvInsertHeader] = useState<boolean>(false)
  const [csvQuoteAll, setCsvQuoteAll] = useState<boolean>(false)
  // settings for plain text
  const [textEncoding, setTextEncoding] = useState<string>(TEXT_ENCODINGS[0].items[0].value)
  const [textNewline, setTextNewline] = useState<string>(newlines[0].value)
  const [textOmitTimestamps, setTextOmitTimestamps] = useState<boolean>(false)

  useEffect(() => {
    let found = false
    timelineData.map((timeline) => {
      if (timeline.id == selectedRowId) {
        _target.current = timeline
        found = true
      }
    })
    if (!found) {
      _target.current = null
    }
  }, [target, timelines])

  const _setOutputFormat = (value: OUTPUT_FORMAT_TYPES) => {
    setOutputFormat(value)
    if (value) {
      window.electronAPI.setConfig({
        outputFormat: value,
      })
    }
  }

  const _setCsvFormat = (value: CSV_PRESET_TYPES) => {
    setCsvFormat(value)
    const _preset = csvPresets[value]
    if (!_preset) {
      return
    }
    setCsvSeparator(_preset[0])
    setCsvEncoding(_preset[1])
  }

  const save = () => {
    window.electronAPI.exportCC({format: outputFormat}).then((filePath) => {
      if (filePath) {
        let options: TextOptions|CsvOptions
        if (outputFormat === 'txt') {
          options = {
            newline: textNewline,
            encoding: textEncoding,
          }
        } else if (outputFormat === 'csv') {
          options = {
            separator: csvSeparator,
            encoding: csvEncoding,
            timestampFormat: csvTimestampFormat,
            omitEndTimestamps: csvOmitEndTimestamps,
            insertHeader: csvInsertHeader,
            quoteAll: csvQuoteAll,
          }
        }

        exportCCFile(filePath, outputFormat, _target.current.actions, options)
      }
    })
  }

  useEffect(() => {
    setTimelines(() => {
      return timelineData.map((_timeline) => {
        return {label: _timeline.name, value: _timeline.id}
      })
    })
  }, [timelineData])

  useEffect(() => {
    setTarget(selectedRowId)
  }, [selectedRowId])

  return (
    <Modal
      title="字幕ファイル出力"
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={false}
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      overlayProps={{blur: 1}}
    >
      <form>
        <Stack gap="sm">
          <Group>
            <Select
              label="出力形式"
              id="outputformat"
              data={formats}
              value={outputFormat}
              onChange={_setOutputFormat}
              checkIconPosition="right"
              allowDeselect={false}
              size="sm"
              radius="sm"
            />
          </Group>
          <Select
            label="出力対象"
            id="target"
            data={timelines}
            value={target}
            onChange={(v) => setTarget(v)}
            checkIconPosition="right"
            allowDeselect={false}
            size="sm"
            radius="sm"
          />
          <Group justify="flex-end">
            <Button
              onClick={save}
              disabled={!outputFormat || !target}
            >
              出力
            </Button>
          </Group>
          {
            outputFormat === 'csv' ?
              <>
                <Divider/>
                <Group>
                  <Text fw="bold" size="sm">CSVの詳細設定</Text>
                </Group>
                <Group wrap="nowrap">
                  <Select
                    label="区切り文字・文字コード"
                    id="csvpreset"
                    data={csvFormats}
                    value={csvFormat}
                    onChange={(v: CSV_PRESET_TYPES) => _setCsvFormat(v)}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                  <Select
                    label="区切り文字"
                    id="csvseparator"
                    data={csvSeparators}
                    value={csvSeparator}
                    onChange={(v: CSV_PRESET_TYPES) => _setCsvFormat(v)}
                    disabled={csvFormat !== CSV_PRESET_CUSTOM}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                  <Select
                    label="文字コード"
                    id="csvencoding"
                    data={TEXT_ENCODINGS}
                    value={csvEncoding}
                    onChange={(v) => setCsvEncoding(v)}
                    disabled={csvFormat !== CSV_PRESET_CUSTOM}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                </Group>
                <Group>
                  <Select
                    label="タイムスタンプの形式"
                    id="csvtimestamp"
                    data={csvTimestampFormats}
                    value={csvTimestampFormat}
                    onChange={(v) => setCsvTimestampFormat(v)}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                  <Checkbox
                    label="開始時間のみ出力"
                    checked={csvOmitEndTimestamps}
                    onChange={(e) => setCsvOmitEndTimestamps(e.target.checked)}
                  />
                </Group>
                <Checkbox
                  label="1行目にヘッダーを挿入する"
                  checked={csvInsertHeader}
                  onChange={(e) => setCsvInsertHeader(e.target.checked)}
                />
                <Checkbox
                  label="すべての値を &quot; で囲む"
                  checked={csvQuoteAll}
                  onChange={(e) => setCsvQuoteAll(e.target.checked)}
                />
              </> :
              <></>
          }
          {
            outputFormat === 'txt' ?
              <>
                <Divider/>
                <Group>
                  <Text fw="bold" size="sm">プレーンテキストの詳細設定</Text>
                </Group>
                <Group>
                  <Select
                    label="文字コード"
                    id="coding"
                    data={TEXT_ENCODINGS}
                    value={textEncoding}
                    onChange={(v) => setTextEncoding(v)}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                  <Select
                    label="改行コード"
                    id="coding"
                    data={newlines}
                    value={textNewline}
                    onChange={(v) => setTextNewline(v)}
                    checkIconPosition="right"
                    allowDeselect={false}
                    size="sm"
                    radius="sm"
                  />
                </Group>
                <Checkbox
                  label="タイムスタンプを出力せず、テキストのみ出力する"
                  checked={textOmitTimestamps}
                  onChange={(e) => setTextOmitTimestamps(e.target.checked)}
                />
              </> :
              <></>
          }
        </Stack>
      </form>
    </Modal>
  )
}

export default OutputModal
