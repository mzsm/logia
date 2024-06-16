import { dialog } from 'electron'
import { OUTPUT_FORMAT_DICT, OUTPUT_FORMAT_TYPES } from '../const'
import fs from 'fs'
import iconv from 'iconv-lite'

const EXT_VIDEO = ['mp4', 'mov', 'mkv', 'webm']
const EXT_AUDIO = ['m4a', 'mp3', 'ogg', 'opus', 'wav']
const EXT_MEDIA = [].concat(...EXT_VIDEO, ...EXT_AUDIO)

export interface FfmpegMediaInfo {
  format: string
  format_long: string
  duration: number
  duration_time: string
  bit_rate: number
  video: {
    name: string
    profile: string
    width: number
    height: number
    frame_rate: number
  }[]
  audio: {
    name: string
    profile: string
    bit_rate: number
    sample_rate: number
    channels: number
  }[]
  format_text: string
}

export const showMediaOpenDialog = async () => {
  const opened = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {
        name: 'Media files',
        extensions: EXT_MEDIA,
      },
    ],
  })
  if (opened.canceled) {
    return null
  }

  return opened.filePaths[0]
}

export const showCCSaveDialog = async (format: OUTPUT_FORMAT_TYPES) => {
  const {name, extensions} = OUTPUT_FORMAT_DICT[format]

  const result = await dialog.showSaveDialog({
    title: '字幕ファイル出力',
    properties: ['createDirectory', 'showOverwriteConfirmation'],
    filters: [
      {name, extensions},
      ...(process.platform === 'win32' ? [{name: 'すべてのファイル', extensions:['*']}] : [])
    ],
  })
  if (result.canceled) {
    return null
  }

  return result.filePath
}

export const saveFile = async (path: string, content: string, encoding: string|null) => {
  if (encoding) {
    let addBOM = false
    if (encoding === 'utf8-bom') {
      encoding = 'utf8'
      addBOM = true
    } else if (['utf16le', 'utf32le', 'utf32be'].includes(encoding)) {
      addBOM = true
    }
    fs.writeFile(path, iconv.encode(content, encoding, {addBOM}), () => {})
  } else {
    fs.writeFile(path, content, () => {})
  }
}
