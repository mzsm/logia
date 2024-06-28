import { app, BrowserWindow, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, shell } from 'electron'
import { isAppleSilicon, isRosetta } from 'is-apple-silicon'
import path from 'path'
import {
  loadProjectFile,
  saveFile,
  showCCSaveDialog,
  showMediaOpenDialog,
  showProjectOpenDialog,
  showProjectSaveDialog,
} from './features/file'
import { getMediaInfo } from './features/ffmpeg'
import { abortTranscription, startTranscription } from './features/transcript'
import store from './store'
import { ContentStatus, TranscriptionParams } from './declare'
import log from 'electron-log/main'
import os from 'os'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow: BrowserWindow = undefined
let fileTemp: string = undefined
let contentStatus: ContentStatus = {
  mediaFilePath: null,
  projectFilePath: null,
}

app.on('open-file', async (e, filePath) => {
  e.preventDefault()
  if (mainWindow) {
    mainWindow.webContents.send('open_media', filePath)
  } else {
    fileTemp = filePath
  }
})

const createWindow = () => {
  log.initialize()
  log.debug(`OS: ${os.type()}`)
  log.debug(`Platform: ${os.platform()}`)
  log.debug(`Version: ${os.version()} (${process.getSystemVersion()})`)
  const mem = process.getSystemMemoryInfo().total
  log.debug(`Memory: ${mem} KB`)
  log.debug(`CPUs: ${os.cpus().length} CPUs`)
  os.cpus().forEach((_cpu, index) => {
    log.debug(`  [${index}] ${_cpu.model}`)
  })
  app.getGPUInfo('complete').then((gpuInfo: {
    auxAttributes: { glRenderer: string };
    gpuDevice: { vendorId: number, deviceId: number, driverVersion: string, driverVendor?: string }[]
  }) => {
    log.debug(`GPUinfo: ${gpuInfo.auxAttributes.glRenderer}`)
    gpuInfo.gpuDevice.forEach((_gpu, index) => {
      log.debug(`  [${index}] Vendor:${_gpu.vendorId}(${_gpu.driverVendor}) Device:${_gpu.deviceId} Ver.:${_gpu.driverVersion}`)
    })
  })

  const windowPosition = store.get('windowPosition')
  const windowSize = store.get('windowSize')

  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: windowPosition.x,
    y: windowPosition.y,
    width: windowSize.width,
    height: windowSize.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: app.isPackaged,
    },
    show: false,
  })
  // mainWindowState.manage(mainWindow)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  // createLogFile()

  mainWindow.addListener('moved', () => {
    const [x, y] = mainWindow.getPosition()
    store.set('windowPosition', {x, y})
  })
  mainWindow.addListener('resize', () => {
    const [width, height] = mainWindow.getSize()
    mainWindow.webContents.send('resize', {width, height})
  })
  mainWindow.addListener('resized', () => {
    const [width, height] = mainWindow.getSize()
    store.set('windowSize', {width, height})
  })

  // Menu
  const buildMenu = () => {
    const isMac = process.platform === 'darwin'
    const templateMenu: (MenuItemConstructorOptions | MenuItem)[] = [
      // { role: 'appMenu' }
      // { role: 'fileMenu' }
      {
        label: 'File',
        submenu: [
          {
            label: 'Open Media File...',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const media = await showMediaOpenDialog()
              if (media) {
                mainWindow.webContents.send('open_media', media)
              }
            },
          },
          {
            label: 'Open Project File...',
            accelerator: 'CmdOrCtrl+P',
            click: async () => {
              const projectFile = await showProjectOpenDialog()
              if (projectFile) {
                mainWindow.webContents.send('open_project', projectFile)
              }
            },
          },
          {type: 'separator'},
          {
            label: 'Save Project File As...',
            enabled: !!contentStatus.mediaFilePath,
            accelerator: 'CmdOrCtrl+S',
            click: async () => {
              const dest = await showProjectSaveDialog(
                contentStatus.projectFilePath || contentStatus.mediaFilePath,
              )
              if (dest) {
                mainWindow.webContents.send('save_project', dest)
              }
            },
          },
          {type: 'separator'},
          isMac ? {role: 'close'} : {role: 'quit'},
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {role: 'undo'},
          {role: 'redo'},
          {type: 'separator'},
          {role: 'cut'},
          {role: 'copy'},
          {role: 'paste'},
          ...(isMac
            ? [
              {role: 'pasteAndMatchStyle'},
              {role: 'delete'},
              {role: 'selectAll'},
            ] as MenuItemConstructorOptions[]
            : [
              {role: 'delete'},
              {type: 'separator'},
              {role: 'selectAll'},
            ] as MenuItemConstructorOptions[]),
        ],
      },
      {
        label: 'Transcription',
        submenu: [
          {
            label: 'AI Auto Transcribe',
            enabled: !!contentStatus.mediaFilePath,
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              mainWindow.webContents.send('show_transcription_dialog')
            },
          },
        ],
      },
      {
        label: 'Debug',
        submenu: [
          {
            label: 'Open AppData directory',
            click: () => shell.openPath(path.join(app.getPath('appData'), app.getName())),
          },
          ...(isMac
              ? [
                {
                  label: 'Open Library directory',
                  click: () => shell.openPath(path.join(app.getPath('home'), 'Library', 'Application Support', app.getName().toLowerCase())),
                },
                {
                  label: 'Open Logs directory',
                  click: () => shell.openPath(path.join(app.getPath('home'), 'Library', 'Logs', app.getName())),
                },
              ] as MenuItemConstructorOptions[]
              : []
          ),
          ...(!app.isPackaged
              ? [
                {type: 'separator'},
                {
                  label: 'Open Dev Tools',
                  accelerator: 'F12',
                  click: () => mainWindow.webContents.openDevTools({mode: 'undocked'}),
                },
              ] as MenuItemConstructorOptions[]
              : []
          ),
        ],
      },
    ]
    if (isMac) {
      templateMenu.unshift({
        label: app.name,
        submenu: [
          {role: 'about'},
          {type: 'separator'},
          {role: 'services'},
          {type: 'separator'},
          {role: 'hide'},
          {role: 'hideOthers'},
          {role: 'unhide'},
          {type: 'separator'},
          {role: 'quit'},
        ],
      })
    }
    const menu = Menu.buildFromTemplate(templateMenu)
    Menu.setApplicationMenu(menu)
  }
  buildMenu()

  ipcMain.handle('contentStatus', (_, status: ContentStatus) => {
    contentStatus = Object.assign(contentStatus, status)
    buildMenu()
  })

  ipcMain.handle(
    'startTranscription',
    async (_, args: TranscriptionParams,
    ) => {
      try {
        await startTranscription(mainWindow, args)
      } catch (e) {
        // pass
      }
    })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }

  ipcMain.handle('contentReady', async () => {
    if (fileTemp) {
      mainWindow.webContents.send('open_media', fileTemp)
      fileTemp = undefined
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle('getConfig', async (_, key: string) => {
  return await store.get(key)
})
ipcMain.handle('setConfig', async (_, value: object) => {
  store.set(value)
})

ipcMain.handle('isAppleSilicon', () => {
  return isAppleSilicon() && !isRosetta()
})

ipcMain.handle('open:mediaFile', async () => {
  return await showMediaOpenDialog()
})

ipcMain.handle('open:projectFile', async () => {
  return await showProjectOpenDialog()
})

ipcMain.handle('load:projectFile', async (_, path) => {
  return await loadProjectFile(path)
})

ipcMain.handle('save:projectFile', async () => {
  return await showProjectSaveDialog(contentStatus.projectFilePath || contentStatus.mediaFilePath)
})

ipcMain.handle('save:ccFile', async (_, {format}) => {
  return await showCCSaveDialog(format, contentStatus.projectFilePath || contentStatus.mediaFilePath)
})

ipcMain.handle('save', async (_, {path, content, encoding}) => {
  return await saveFile(path, content, encoding)
})

ipcMain.handle('getMediaInfo', async (_, filePath: string) => {
  return await getMediaInfo(filePath)
})

ipcMain.handle('abortTranscription', async (_, id: string) => {
  abortTranscription(id)
})
