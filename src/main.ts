import { app, BrowserWindow, ipcMain, Menu, MenuItem, MenuItemConstructorOptions } from 'electron'
import { isAppleSilicon, isRosetta } from 'is-apple-silicon'
import path from 'path'
import { saveFile, showCCSaveDialog, showMediaOpenDialog } from './features/file'
import { getMediaInfo } from './features/ffmpeg'
import { abortTranscription, startTranscription } from './features/transcript'
import store from './store'
import { TranscriptionParams } from './declare'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = () => {
  const windowPosition = store.get('windowPosition')
  const windowSize = store.get('windowSize')

  // Create the browser window.
  const mainWindow = new BrowserWindow({
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
  const isMac = process.platform === 'darwin'
  const templateMenu: (MenuItemConstructorOptions | MenuItem)[] = [
    // { role: 'appMenu' }
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Video File...',
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
          click: () => showMediaOpenDialog(),
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
  if (!app.isPackaged) {
    templateMenu.push({
      label: 'Debug',
      submenu: [
        {
          label: 'Open Dev Tools',
          accelerator: 'F12',
          click: () => mainWindow.webContents.openDevTools({mode: 'undocked'}),
        },
      ],
    })

  }
  const menu = Menu.buildFromTemplate(templateMenu)
  Menu.setApplicationMenu(menu)

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

ipcMain.handle('save:ccFile', async (_, {format}) => {
  return await showCCSaveDialog(format)
})

ipcMain.handle('save', async (_, {path, content, encoding}) => {
  return await saveFile(path, content, encoding)
})

ipcMain.handle('getMediaInfo', async (_, filePath: string) => {
  return await getMediaInfo(filePath)
})

ipcMain.handle('abortTranscription', async () => {
  abortTranscription()
})
