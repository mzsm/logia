/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import React from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import App from './App'

import '@mantine/core/styles.css'
import '@mantine/nprogress/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'
import './index.css'
import { NavigationProgress } from '@mantine/nprogress'

const root = createRoot(document.getElementById('app'))
root.render(
  <MantineProvider defaultColorScheme="dark">
    <NavigationProgress size={4}/>
    <App/>
  </MantineProvider>,
)
