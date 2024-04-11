import { FfmpegMediaInfo } from './file'
import { execFile } from 'child_process'
import { app } from 'electron'
import path from 'path'

export const getMediaInfo = async (filePath: string): Promise<FfmpegMediaInfo> => {
  return new Promise((resolve) => {
    return execFile(
      app.isPackaged ? '' : path.join(app.getAppPath(), '.venv', 'bin', 'python'),
      [
        app.isPackaged ? '' : path.join(app.getAppPath(), 'py_src', 'py_backend.py'),
        'media_info',
        filePath,
      ],
      (error, stdout, stderr) => {
        resolve(JSON.parse(stdout))
      }
    )
  })
}
