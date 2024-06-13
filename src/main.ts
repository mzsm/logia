import { app, Menu, BrowserWindow, MenuItemConstructorOptions, MenuItem, ipcMain } from 'electron'
import path from 'path'
import { showMediaOpenDialog, showCCSaveDialog, saveFile } from './features/file'
import { getMediaInfo } from './features/ffmpeg'
import { startTranscription, abortTranscription } from './features/transcript'
import store from './store'

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
  mainWindow.addListener('resize', (e: unknown) => {
    const [width, height] = mainWindow.getSize()
    mainWindow.webContents.send('resize', {width, height})
  })
  mainWindow.addListener('resized', (e: unknown) => {
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
          ]
          : [
            {role: 'delete'},
            {type: 'separator'},
            {role: 'selectAll'},
          ]),
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
    async (event, args: {
             filePath: string;
             id?: string;
             language?: string;
             model?: string;
             begin?: number;
             end?: number
           },
    ) => {
      try {
        await startTranscription(mainWindow, args.filePath, args.id, args.language, args.model, args.begin, args.end)
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

ipcMain.handle('getConfig', async (event, key: string) => {
  return await store.get(key)
})
ipcMain.handle('setConfig', async (event, value: object) => {
  store.set(value)
})

ipcMain.handle('open:mediaFile', async () => {
  return await showMediaOpenDialog()
})

ipcMain.handle('save:ccFile', async () => {
  return await showCCSaveDialog()
})

ipcMain.handle('save', async (event, {path, content}) => {
  // console.log(event, path, content)
  return await saveFile(path, content)
})

ipcMain.handle('getMediaInfo', async (event, filePath: string) => {
  return await getMediaInfo(filePath)
})

ipcMain.handle('abortTranscription', async () => {
  abortTranscription()
})
