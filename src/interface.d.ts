import { FfmpegMediaInfo } from './features/file'
import { OUTPUT_FORMAT_TYPES } from './const'

export interface IElectronAPI {
  // Main <= Renderer
  getConfig: (key: string) => Promise<unknown>,
  setConfig: (args: { [key: string]: unknown }) => void,
  openMediaFile: () => Promise<string | null>,
  exportCC: (args: {format: OUTPUT_FORMAT_TYPES}) => Promise<string | null>,
  saveFile: (args: {path: string, content: string, encoding: string|null}) => Promise<string | null>,
  getMediaInfo: (filePath: string) => Promise<FfmpegMediaInfo | null>,
  startTranscription: (args: { filePath: string; id?: string;  language?: string; model?: string; begin?: number; end?: number }) => Promise<unknown | null>,
  abortTranscription: () => Promise<unknown>,
  // Main => Renderer
  onOpenMedia: (callback: (filePath: string) => unknown) => unknown,
  onTranscriptionProgress: (callback: (value: {
    id: string;
    data: Array<{
      type: number;
      begin?: number;
      end?: number;
      text?: string
    }>
  }) => unknown) => unknown,
  onResizeWindow: (callback: (value: {width: number, height: number}) => unknown) => unknown,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

