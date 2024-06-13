import { TimelineAction, TimelineRow } from 'react-timeline-editor'

export interface TranscriptionText extends TimelineAction {
  text: string
  words?: {
    begin: number,
    end: number
  }[]
}

export interface TranscriptionRow extends TimelineRow {
  progress: boolean
  name: string,
  actions: TranscriptionText[]
}
