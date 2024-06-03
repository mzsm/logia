import Store from 'electron-store'

interface Schema {
  windowPosition: {x: number|null, y: number|null}
  windowSize: {width: number, height: number}
  languageHistory: string[]
  model: string,
  previewHeight: number,
}

const defaults: Schema = {
  windowPosition: {x: null, y: null},
  windowSize: {width: 800, height: 600},
  languageHistory: [],
  model: 'medium',
  previewHeight: 300,
}

const store = new Store({
  name: 'config',
  defaults,
})

export default store
