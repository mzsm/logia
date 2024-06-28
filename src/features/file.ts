import path from 'path'
import { dialog } from 'electron'
import { OUTPUT_FORMAT_DICT, OUTPUT_FORMAT_TYPES } from '../const'
import { ProjectFileFormat } from '../declare'
import fs from 'fs/promises'
import iconv from 'iconv-lite'

const EXT_VIDEO = ['mp4', 'mov', 'mkv', 'webm']
const EXT_AUDIO = ['m4a', 'aac', 'mp3', 'ogg', 'opus', 'wav']
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

const _excludeExt = (filepath: string | null) => {
  return filepath ? filepath.replace(new RegExp('\\' + path.extname(filepath) + '$'), '')  : null
}

const _showSaveDialog = async (title: string, filters: Electron.FileFilter[], defaultPath?: string | null) => {
  const result = await dialog.showSaveDialog({
    title,
    defaultPath: _excludeExt(defaultPath),
    properties: ['createDirectory', 'showOverwriteConfirmation'],
    filters: [
      ...filters,
      ...(process.platform === 'win32' ? [{name: 'すべてのファイル', extensions: ['*']}] : []),
    ],
  })
  if (result.canceled) {
    return null
  }
  return result.filePath
}

export const showMediaOpenDialog = async () => {
  const opened = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'Media Files', extensions: EXT_MEDIA}],
  })
  if (opened.canceled) {
    return null
  }
  return opened.filePaths[0]
}

export const showProjectOpenDialog = async () => {
  const opened = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'Logia Project Files', extensions: ['logia']}],
  })
  if (opened.canceled) {
    return null
  }
  return opened.filePaths[0]
}

export const showProjectSaveDialog = async (defaultPath?: string | null) => {
  return await _showSaveDialog(
    'プロジェクトファイル保存',
    [{name: 'Logia Project File', extensions: ['logia']}],
    defaultPath
  )
}

export const showCCSaveDialog = async (format: OUTPUT_FORMAT_TYPES, defaultPath?: string | null) => {
  const {name, extensions} = OUTPUT_FORMAT_DICT[format]
  return await _showSaveDialog(
    '字幕ファイル出力',
    [{name, extensions}],
    defaultPath
  )
}

export const saveFile = async (path: string, content: string, encoding?: string | null) => {
  if (encoding) {
    let addBOM = false
    if (encoding === 'utf8-bom') {
      encoding = 'utf8'
      addBOM = true
    } else if (['utf16le', 'utf32le', 'utf32be'].includes(encoding)) {
      addBOM = true
    }
    fs.writeFile(path, iconv.encode(content, encoding, {addBOM})).then()
  } else {
    fs.writeFile(path, content).then()
  }
}

export const loadProjectFile = async (path: string) => {
  try {
    const projectData = await fs.readFile(path, 'utf8')
    return JSON.parse(projectData) as ProjectFileFormat
  } catch (e) {
    return null
  }
}
