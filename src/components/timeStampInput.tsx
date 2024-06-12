import { FocusEventHandler, useEffect, useRef, useState } from 'react'
import { MantineRadius, MantineSize, TextInput } from '@mantine/core'
import { formatTime, parseTimeCode } from '../utils'


interface Props {
  variant?: string
  label?: string
  size?: MantineSize | NonNullable<string>
  radius?: MantineRadius
  value: number
  max?: number
  disabled?: boolean
  onChange?: (value: number) => unknown
  onFocus?: FocusEventHandler<HTMLInputElement>
  withMS?: boolean
}

function TimeStampInput({
                          variant = 'default',
                          label,
                          size,
                          radius,
                          value,
                          max,
                          disabled = false,
                          onChange,
                          onFocus,
                          withMS = true,
                        }: Props) {
  const input = useRef(null)
  const [tempValue, setTempValue] = useState(formatTime(value, true))

  const setValue: FocusEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as HTMLInputElement
    if (target.checkValidity()) {
      let value = Math.max(0, parseTimeCode(target.value))
      if (max) {
        value = Math.min(value, max)
      }
      onChange && onChange(value)
    } else {
      setTempValue(formatTime(value, withMS))
    }
  }

  useEffect(() => {
    setTempValue(formatTime(value, withMS))
  }, [value])

  return (
    <TextInput
      ref={input}
      label={label}
      variant={variant}
      size={size}
      radius={radius}
      style={{
        width: '7.5rem',
      }}
      value={tempValue}
      disabled={disabled}
      onChange={(e) => setTempValue(e.target.value)}
      onFocus={onFocus}
      onBlur={setValue}
      pattern="^((\d+:)?\d+:)?\d+(\.\d*)?$"
    />
  )
}

export default TimeStampInput
