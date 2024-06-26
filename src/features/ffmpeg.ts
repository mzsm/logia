import os from 'os'
import { FfmpegMediaInfo } from './file'
import { execFile } from 'child_process'
import { app } from 'electron'
import path from 'path'

export const getMediaInfo = async (filePath: string): Promise<FfmpegMediaInfo|string> => {
  return new Promise((resolve) => {
    const args: string[] = ['media_info', filePath]
    if (!app.isPackaged) {
      args.unshift(path.join(app.getAppPath(), 'py_src', 'py_backend.py'))
    }
    return execFile(
      app.isPackaged ? path.join(path.dirname(app.getAppPath()), 'backend', 'logia_backend') :
          os.platform() === 'win32' ?
            path.join(app.getAppPath(), '.venv', 'Scripts', 'python.exe') :
            path.join(app.getAppPath(), '.venv', 'bin', 'python')
        ,
      args,
      (error, stdout, stderr) => {
        try {
          resolve(JSON.parse(stdout))
        } catch (e) {
          resolve({
            format: error.toString(),
            format_long: stderr,
            duration: 0,
            duration_time: '0',
            video: [],
            audio: [],
            format_text: '',
            bit_rate: null
          })
        }
      }
    )
  })
}
