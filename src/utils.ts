

export const formatTime = (time: number, withMs=false, isMs=false) => {
  time = isMs ? time / 1000 : time
  return `${('0' +Math.floor(time / 3600)).slice(-2)}:`+
    `${('0' + (Math.floor(time % 3600 / 60))).slice(-2)}:`+
    `${('0' + (Math.floor(time % 60))).slice(-2)}` +
    (withMs? `.${('000' + Math.floor(time * 1000 % 1000)).slice(-3)}`: '')
}

export const parseTimeCode = (timeCode: string) => {
  const weights = [1, 60, 3600]
  let val = 0
  const [_timeCode, ms] = timeCode.split('.')
  if (ms) {
    val = parseInt((ms + '000').slice(0, 3), 10) / 1000
  }
  return _timeCode.split(':').reverse().reduce((previousValue, currentValue, currentIndex) => {
    return previousValue + (parseInt(currentValue, 10) * (weights[currentIndex]))
  }, val)
}
