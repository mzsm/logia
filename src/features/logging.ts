import path from 'path'
import { app } from 'electron'

export const createLogFile = async () => {
  const baseDir = app.isPackaged ? app.getPath('userData') : app.getAppPath()
  const dirPath = path.join(baseDir, 'logs')
  app.setAppLogsPath(dirPath)
}
