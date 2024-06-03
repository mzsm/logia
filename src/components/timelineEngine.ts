import { TimelineEngine } from 'react-timeline-editor'
import { MutableRefObject } from 'react'

export default class VideoEngine extends TimelineEngine {
  constructor(private mediaTag: MutableRefObject<HTMLMediaElement>) {
    super()
  }


  get isPlaying() {
    return !this.mediaTag.current.paused
  }

  get isPaused() {
    return this.mediaTag.current.paused
  }

  _startOrStop(type?: 'start' | 'stop') {
    if (type === 'start') {
      this.mediaTag.current.play()
    } else if (type === 'stop') {
      this.mediaTag.current.pause()
    }
  }

  getPlayRate(): number {
    return this.mediaTag.current.playbackRate
  }

  getTime(): number {
    return this.mediaTag.current.currentTime
  }

  setTime(time: number, isTick?: boolean): boolean {
    if (isTick) {
      this._dealLeave(time)
      this._dealEnter(time)
      this.trigger('setTimeByTick', {time, engine: this})
      return true
    }
    this.mediaTag.current.currentTime = time
    return super.setTime(time, isTick)
  }

  play(param: { toTime?: number; autoEnd?: boolean }): boolean {
    return super.play(param)
  }

}
