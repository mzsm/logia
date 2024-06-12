import { Container, Group, Stack, Textarea } from '@mantine/core'
import TimeStampInput from './timeStampInput'
import { TranscriptionText } from '../declare'
import { useEffect, useState } from 'react'

interface Props {
  text: TranscriptionText
  onChange?: () => unknown
}

function TextEditArea({text, onChange}: Props) {
  const [start, setStart] = useState(text.start)
  const [end, setEnd] = useState(text.end)
  const [textString, setTextString] = useState(text.text)
  const _onChange = () => {
    onChange && onChange()
  }

  useEffect(() => {
    setStart(text.start)
    setEnd(text.end)
    setTextString(text.text)
  }, [text])

  return (
    <Container
      pt={16}
      pb={16}
      style={{maxHeight: '100%', overflow: 'scroll'}}
    >
      <Stack>
        <Group>
          <TimeStampInput
            label="開始時間"
            value={start}
            onChange={(v) => {setStart(v); text.start = v; _onChange()}}
          />
          <TimeStampInput
            label="終了時間"
            value={end}
            onChange={(v) => {setEnd(v); text.end = v; _onChange()}}
          />
        </Group>
        <Textarea
          value={textString}
          autosize={true}
          onChange={(e) => { setTextString(e.target.value); text.text = e.target.value as string; _onChange() }}
        />
      </Stack>
    </Container>
  )
}

export default TextEditArea
