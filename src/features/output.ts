import { formatTime } from '../utils'


export const exportCCFile = (filePath: string, transcript: {
  type: number;
  begin: number;
  end: number;
  text: string
}[]) => {
  let body = ''
  if (filePath.endsWith('.txt')) {
    body = toPlainText(transcript)
  } else if (filePath.endsWith('.csv')) {
    body = toCSV(transcript)
  } else if (filePath.endsWith('.vtt')) {
    body = toWebVTT(transcript)
  } else if (filePath.endsWith('.srt')) {
    body = toSubRip(transcript)
  } else if (filePath.endsWith('.sbv')) {
    body = toSubViewer(transcript)
  }

  if (body.length) {
    window.electronAPI.saveFile({
      path: filePath,
      content: body,
    }).then()
  }
  // openMedia(media)
}

export const toPlainText = (transcript: { type: number; begin: number; end: number; text: string }[]) => {
  return transcript.map((segment) => {
    return segment.text
  }).join('\n')
}

export const toCSV = (transcript: { type: number; begin: number; end: number; text: string }[]) => {
  return transcript.map((segment) => {
    return `${formatTime(segment.begin, true)},${formatTime(segment.end, true)},"${segment.text.replace('"', '\\"')}"`
  }).join('\r\n')
}

export const toWebVTT = (transcript: { type: number; begin: number; end: number; text: string }[]) => {
  return [
    'WEBVTT',
    ...transcript.map((segment) => {
      return `${formatTime(segment.begin, true)} --> ${formatTime(segment.end, true)}\n${segment.text}`
    }),
  ].join('\n\n')
}


export const toSubRip = (transcript: { type: number; begin: number; end: number; text: string }[]) => {
  return transcript.map((segment, index) => {
    return `${index + 1}\n${formatTime(segment.begin, true).replace('.', ',')} --> ${formatTime(segment.end, true).replace('.', ',')}\n${segment.text}`
  }).join('\n\n')
}

export const toSubViewer = (transcript: { type: number; begin: number; end: number; text: string }[]) => {
  return transcript.map((segment) => {
    return `${formatTime(segment.begin, true)},${formatTime(segment.end, true)}\n${segment.text}`
  }).join('\n\n')
}

