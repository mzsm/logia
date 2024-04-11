import { FfmpegMediaInfo } from './features/file'

export interface IElectronAPI {
  // Main <= Renderer
  getConfig: (key: string) => Promise<unknown>,
  setConfig: (args: { [key: string]: unknown }) => void,
  openMediaFile: () => Promise<string | null>,
  exportCC: () => Promise<string | null>,
  saveFile: (args: {path: string, content: string}) => Promise<string | null>,
  getMediaInfo: (filePath: string) => Promise<FfmpegMediaInfo | null>,
  startTranscription: (args: { filePath: string; language?: string; model?: string; begin?: number; end?: number }) => Promise<unknown | null>,
  abortTranscription: () => Promise<unknown>,
  // Main => Renderer
  onOpenMedia: (callback: (filePath: string) => unknown) => unknown,
  onTranscriptionProgress: (callback: (value: {
    type: number;
    begin?: number;
    end?: number;
    text?: string
  }[]) => unknown) => unknown,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

declare module 'react-subtitle-editor'
