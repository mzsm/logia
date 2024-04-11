import Store from 'electron-store'

interface Schema {
  languageHistory: string[]
  model: string,
  previewHeight: number,
}

const defaults: Schema = {
  languageHistory: [],
  model: 'medium',
  previewHeight: 300,
}

const store = new Store({
  name: 'config',
  defaults,
})

export default store
