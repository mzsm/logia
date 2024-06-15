import { formatTime } from '../utils'
import { TranscriptionText } from '../declare'
import { OUTPUT_FORMAT_TYPES } from '../const'

export interface TextOptions {
  encoding: string
  newline: string
}
export interface CsvOptions {
  separator: string
  encoding: string
  timestampFormat: string
  omitEndTimestamps: boolean
  insertHeader: boolean
  quoteAll: boolean
}

export const exportCCFile = (filePath: string, format: OUTPUT_FORMAT_TYPES, transcript: TranscriptionText[], options?: TextOptions|CsvOptions) => {
  let body = ''
  if (format === 'txt') {
    body = toPlainText(transcript, options as TextOptions)
  } else if (format === 'csv') {
    body = toCSV(transcript, options as CsvOptions)
  } else if (format === 'vtt') {
    body = toWebVTT(transcript)
  } else if (format === 'srt') {
    body = toSubRip(transcript)
  } else if (format === 'sbv') {
    body = toSubViewer(transcript)
  }

  if (body.length) {
    let encoding = null
    if (options) {
      encoding = options.encoding
    }

    window.electronAPI.saveFile({
      path: filePath,
      content: body,
      encoding
    }).then()
  }
  // openMedia(media)
}

export const toPlainText = (transcript: TranscriptionText[], options: TextOptions) => {
  return transcript.map((segment) => {
    return segment.text
  }).join(options.newline)
}

export const toCSV = (transcript: TranscriptionText[], options: CsvOptions) => {
  return transcript.map((segment) => {
    return `${formatTime(segment.start, true)}${options.separator}${formatTime(segment.end, true)}${options.separator}"${segment.text.replace('"', '\\"')}"`
  }).join('\r\n')
}

export const toWebVTT = (transcript: TranscriptionText[]) => {
  return [
    'WEBVTT',
    ...transcript.map((segment) => {
      return `${formatTime(segment.start, true)} --> ${formatTime(segment.end, true)}\n${segment.text}`
    }),
  ].join('\n\n')
}


export const toSubRip = (transcript: TranscriptionText[]) => {
  return transcript.map((segment, index) => {
    return `${index + 1}\n${formatTime(segment.start, true).replace('.', ',')} --> ${formatTime(segment.end, true).replace('.', ',')}\n${segment.text}`
  }).join('\n\n')
}

export const toSubViewer = (transcript: TranscriptionText[]) => {
  return transcript.map((segment) => {
    return `${formatTime(segment.start, true)},${formatTime(segment.end, true)}\n${segment.text}`
  }).join('\n\n')
}

