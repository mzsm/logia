import { TimelineAction, TimelineRow } from 'react-timeline-editor'

export interface TranscriptionText extends TimelineAction {
  text: string
  words?: {
    begin: number,
    end: number
  }[]
}

export interface TranscriptionSequence extends TimelineRow {
  name: string,
  actions: TranscriptionText[]
}

export interface TranscriptionParams {
  filePath: string
  id: string
  language?: string
  model?: string
  start?: number
  end?: number
  computeType?: string
  initialPrompt?: string
  beamSize?: number
}

export interface TranscriptionTask {
  status: number
  promise: Promise<unknown> | null
  params: TranscriptionParams
}

export interface ProjectFileFormat {
  media: string,
  sequenceData: TranscriptionSequence[]
}

export interface ContentStatus {
  mediaFilePath?: string | null
  projectFilePath?: string | null
}
