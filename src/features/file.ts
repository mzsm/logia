import { dialog } from 'electron'
import fs from 'fs'

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

export const showCCSaveDialog = async () => {
  const result = await dialog.showSaveDialog({
    title: '字幕ファイルを出力',
    properties: ['createDirectory', 'showOverwriteConfirmation'],
    filters: [
      {
        name: 'WebVTT',
        extensions: ['.vtt'],
      },
      {
        name: 'SubRip',
        extensions: ['.srt'],
      },
      {
        name: 'SubViewer',
        extensions: ['.sbv'],
      },
      {
        name: 'Plain text',
        extensions: ['.txt'],
      },
    ],
  })
  if (result.canceled) {
    return null
  }

  return result.filePath
}

export const saveFile = async (path: string, content: string) => {
  fs.writeFile(path, content, (error) => {
    console.log(error)
  })
}
