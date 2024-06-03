import { Stack, TextInput } from '@mantine/core'
import TimeStampInput from './timeStampInput'
import { TranscriptionText } from '../declare'
import { useEffect, useState } from 'react'

interface Props {
  text: TranscriptionText
  onChange?: (text: TranscriptionText) => unknown
}

function TextEditArea({text, onChange}: Props) {
  const [tempText, setTempText] = useState(text)
  const [start, setStart] = useState(text.start)
  const [end, setEnd] = useState(text.end)
  const [textString, setTextString] = useState(text.text)
  const _onChange = () => {
    onChange && onChange(tempText)
  }

  useEffect(() => {
    setTempText(text)
  }, [text])

  return (
    <Stack>
      <TimeStampInput
        value={start}
        onChange={setStart}
      />
      <TimeStampInput
        value={end}
        onChange={setEnd}
      />
      <TextInput
        value={textString}
        onInput={(e) => { setTextString(e.currentTarget.value) }}
      />
    </Stack>
  )
}

export default TextEditArea
