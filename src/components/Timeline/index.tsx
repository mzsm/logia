import React, { useEffect, useRef, RefObject, useState } from 'react'
import TimeLine, {Colors} from './T'
import './index.css'


interface TimelineProps {
  autoScroll?: boolean
  colors?: Colors
  data: Array<{begin: number; end: number; text: string}>
  src?: string
  audioRef?: RefObject<HTMLAudioElement>
  player?: RefObject<HTMLMediaElement>
  paddingLeft?: string
  setAligns?: (data: {index: number; begin: number; end: number}) => unknown
  changeZoomLevel?: (zoomLevel: number) => unknown
  changeShift?: (shift: number) => unknown
  changeAreaShow?: (before: number, after: number) => unknown
}

interface TimelinePropsWithEndTime extends TimelineProps {
  endTime: number
}

interface TimeLineIF {
  cancelAnimate: () => unknown
  setData: (data: Array<{begin: number; end: number; text: string}>) => unknown
}

export default function Timeline(props: TimelineProps) {
  const [timeLine, setTimeLine] = useState<TimeLineIF>()
  let shift
  let zoomLevel: number
  let data
  let beginingTimeShow: number
  let endTimeShow: number

  const canvas1 = useRef(null)
  const canvasAudio = useRef(null)
  const canvas2 = useRef(null)

  const changeAlignment = (z: {begin: number; end: number; index: number}) => {
    props.setAligns && props.setAligns(z)
  }
  const changeZoomLevel = (z: number) => {
    props.changeZoomLevel && props.changeZoomLevel(z)
    zoomLevel = z
  }
  const changeShift = (s: number) => {
    props.changeShift && props.changeShift(s)
    shift = s
  }

  const changeAreaShow = (b: number, e: number) => {
    props.changeAreaShow && props.changeAreaShow(b, e)
    beginingTimeShow = b
    endTimeShow = e
  }

  const drawTimeLine = () => {
    setTimeLine(TimeLine(
      canvas1.current,
      canvas2.current,
      props.data,
      props.player.current.duration,
      props.player,
      changeAlignment,
      changeZoomLevel,
      changeShift,
      changeAreaShow,
      {
        autoScroll: props.autoScroll,
        colors: {
          background: props.colors?.background || 'transparent',
          box: props.colors?.box || '#a9a9a9',
          boxHover: props.colors?.boxHover || '#80add6',
          selectedBox: props.colors?.selectedBox || '#1890ff',
          playingBox: props.colors?.playingBox || '#f0523f',
          text: props.colors?.text || '#212b33',
          selectedText: props.colors?.selectedText || 'white',
          tooltipBackground: props.colors?.tooltipBackground || '#474e54',
          tooltipText: props.colors?.tooltipText || 'white',
          scrollBarBackground: props.colors?.scrollBarBackground || '#f1f3f9',
          scrollBar: props.colors?.scrollBar || '#c2c9d6',
          scrollBarHover: props.colors?.scrollBarHover || '#8f96a3',
        },
      },
    ))
  }

  useEffect(() => {
    if (timeLine) timeLine.setData(props.data)
  }, [props.data])

  useEffect(() => {
    drawTimeLine()

    return () => {
      if (timeLine) timeLine.cancelAnimate()
    }
  }, [props.src, props.player.current.duration])

  const style = {
    height: '90px',
    paddingLeft: props.paddingLeft,
  }

  return (
    <div style={style} className="timeline-editor">
      {
        props.player ?
          <></> :
          <div hidden>
            <audio src={props.src} ref={props.audioRef || canvasAudio}/>
          </div>
      }
      <div className="wrap z-index-2">
        <canvas ref={canvas1}></canvas>
      </div>
      <div className="wrap z-index-1">
        <canvas ref={canvas2}></canvas>
      </div>
    </div>
  )
}
