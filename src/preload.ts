// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { OUTPUT_FORMAT_TYPES } from './const'
import { ContentStatus, TranscriptionParams } from './declare'

contextBridge.exposeInMainWorld('electronAPI', {
  // Main <= Renderer
  contentReady: () =>
    ipcRenderer.invoke('contentReady'),
  contentStatus: (status: ContentStatus) =>
    ipcRenderer.invoke('contentStatus', status),
  getConfig: (key: string) =>
    ipcRenderer.invoke('getConfig', key),
  setConfig: (args: { [key: string]: unknown }) =>
    ipcRenderer.invoke('setConfig', args),
  isAppleSilicon: () =>
    ipcRenderer.invoke('isAppleSilicon'),
  openMediaFile: () =>
    ipcRenderer.invoke('open:mediaFile'),
  openProjectFile: () =>
    ipcRenderer.invoke('open:projectFile'),
  saveProjectFile: () =>
    ipcRenderer.invoke('save:projectFile'),
  exportCC: (args: { format: OUTPUT_FORMAT_TYPES }) =>
    ipcRenderer.invoke('save:ccFile', args),
  saveFile: (args: { path: string, content: string, encoding: string | null }) =>
    ipcRenderer.invoke('save', args),
  loadProjectFile: (filePath: string) =>
    ipcRenderer.invoke('load:projectFile', filePath),
  getMediaInfo: (filePath: string) =>
    ipcRenderer.invoke('getMediaInfo', filePath),
  startTranscription: (args: TranscriptionParams) =>
    ipcRenderer.invoke('startTranscription', args),
  abortTranscription: (id: string) =>
    ipcRenderer.invoke('abortTranscription', id),

  // Main => Renderer
  onOpenMedia: (callback: (filePath: string) => unknown) =>
    ipcRenderer.on('open_media', (_event, value) => callback(value)),
  onOpenProjectFile: (callback: (filePath: string) => unknown) =>
    ipcRenderer.on('open_project', (_event, value) => callback(value)),
  onSaveProjectFile: (callback: (filePath: string) => unknown) =>
    ipcRenderer.on('save_project', (_event, value) => callback(value)),
  onShowTranscriptionDialog: (callback: () => unknown) =>
    ipcRenderer.on('show_transcription_dialog', () => callback()),
  onTranscriptionProgress: (callback: (value: { offsets: { from: number; to: number }; text: string }[]) => unknown) =>
    ipcRenderer.on('progress', (_event, value) => callback(value)),
  onResizeWindow: (callback: (value: { width: number, height: number }) => unknown) =>
    ipcRenderer.on('resize', (_event, value) => callback(value)),
})


