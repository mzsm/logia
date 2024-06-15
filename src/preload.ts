// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { FfmpegMediaInfo } from './features/file'
import { contextBridge, ipcRenderer } from 'electron'
import { OUTPUT_FORMAT_TYPES } from './const'

contextBridge.exposeInMainWorld('electronAPI', {
  // Main <= Renderer
  getConfig: (key: string) => ipcRenderer.invoke('getConfig', key),
  setConfig: (args: {[key: string]: unknown}) => ipcRenderer.invoke('setConfig', args),
  openMediaFile: () => ipcRenderer.invoke('open:mediaFile'),
  exportCC: (args: {format: OUTPUT_FORMAT_TYPES}) => ipcRenderer.invoke('save:ccFile', args),
  saveFile: (args: {path: string, content: string, encoding: string|null}) => ipcRenderer.invoke('save', args),
  getMediaInfo: (filePath: string) => ipcRenderer.invoke('getMediaInfo', filePath),
  startTranscription: (args: {filePath: string; id?: string; language?: string; model?: string; begin?: number; end?: number}) => ipcRenderer.invoke('startTranscription', args),
  abortTranscription: () => ipcRenderer.invoke('abortTranscription'),

  // Main => Renderer
  onOpenMedia: (callback: (value: {filePath: string, mediaInfo: FfmpegMediaInfo}) => unknown) => ipcRenderer.on('open_media', (_event, value) => callback(value)),
  onTranscriptionProgress: (callback: (value: {offsets: {from: number; to: number}; text: string}[]) => unknown) => ipcRenderer.on('progress', (_event, value) => callback(value)),
  onResizeWindow: (callback: (value: {width: number, height: number}) => unknown) => ipcRenderer.on('resize', (_event, value) => callback(value))
})


