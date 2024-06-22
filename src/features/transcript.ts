import os from 'os'
import path from 'path'
import { app, BrowserWindow } from 'electron'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { TranscriptionParams } from '../declare'
import { isAppleSilicon, isRosetta } from 'is-apple-silicon'

let currentProcess: ChildProcessWithoutNullStreams | null = null

export const startTranscription = async (mainWindow: BrowserWindow, {
  filePath,
  id,
  language = 'en',
  model,
  computeType,
  start,
  end,
}: TranscriptionParams) => {
  let leftover = ''

  const onProgress = (data: string) => {
    if (!data.endsWith('\n')) {
      leftover += data
      return
    }
    mainWindow.webContents.send(
      'progress',
      {
        id,
        data: (leftover + data).trim().split('\n').map((line) => {
          if (!line.length) {
            return null
          }
          try {
            data = JSON.parse(line)
            leftover = ''
            return data
          } catch (e) {
            // pass
          }
        }).filter(line => line),
      },
    )
    leftover = ''
  }
  return await transcribe(filePath, language, model, computeType, start, end, onProgress)
}

export const abortTranscription = () => {
  if (currentProcess) {
    currentProcess.kill()
  }
  currentProcess = null
}

export const transcribe = async (
  wavPath: string, lang?: string, model = 'medium', computeType = 'auto', start?: number, end?: number, onProgress?: (data: string) => unknown,
): Promise<void> => {
  return new Promise((resolve) => {
    const args = [
      'transcribe',
      wavPath,
      '-m', model,
      '-l', lang || app.getLocale().slice(0, 2),
    ]
    if (!app.isPackaged) {
      args.unshift(path.join(app.getAppPath(), 'py_src', 'py_backend.py'))
    }
    if (start !== undefined) {
      args.push('-s', start.toString())
    }
    if (end !== undefined) {
      args.push('-e', end.toString())
    }
    if (isAppleSilicon() && !isRosetta()) {
      args.push('-x')
    } else if (computeType) {
      args.push('-c', computeType)
    }

    currentProcess = spawn(
      app.isPackaged ?
        path.join(path.dirname(app.getAppPath()), 'backend', 'logia_backend') :
        os.platform() === 'win32' ?
          path.join(app.getAppPath(), '.venv', 'Scripts', 'python.exe') :
          path.join(app.getAppPath(), '.venv', 'bin', 'python'),
      args,
    )
    currentProcess.on('exit', () => {
      // pass
      resolve()
    })

    currentProcess.stdout.setEncoding('utf-8')
    currentProcess.stdout.on('data', (data) => {
      // 進捗報告
      // console.log(data)
      onProgress && onProgress(data)
    })

    // TODO: ログに出力
    currentProcess.stderr.on('data', (data) => {
      console.log(data.toString())
    })
  })
}
