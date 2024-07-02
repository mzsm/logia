import { useEffect, useMemo, useRef, useState } from 'react'
import { ActionIcon, Group, Stack, TextInput } from '@mantine/core'
import { IconArrowBigDownLines, IconPlayerPlay } from '@tabler/icons-react'
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  type MRT_RowVirtualizer,
  useMantineReactTable,
} from 'mantine-react-table'
import { MRT_Localization_JA } from 'mantine-react-table/locales/ja/index.cjs'
import { TranscriptionSequence, TranscriptionText } from '../declare'
import { formatTime } from '../utils'

const TIME_WIDTH = 110
const ACTION_WIDTH = 40

interface Props {
  sequence: TranscriptionSequence
  currentTextId: string
  parentHeight: number
  parentWidth: number
  onClick?: (text: TranscriptionText) => unknown
  onSetTime?: (time: number) => unknown
  onChange?: () => unknown
}

function SequenceTable({sequence, currentTextId, parentHeight, parentWidth, onClick, onSetTime, onChange}: Props) {
  const nameInput = useRef(null)
  const [sequenceName, setSequenceName] = useState<string>('')
  const [sequenceNameTemp, setSequenceNameTemp] = useState<string>('')
  const [autoScroll, setAutoScroll] = useState<boolean>(false)
  const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)

  const _onChange = () => {
    onChange && onChange()
  }

  useEffect(() => {
    setSequenceName(sequence.name)
  }, [sequence])

  const columns = useMemo<MRT_ColumnDef<TranscriptionText>[]>(
    () =>
      [
        {
          accessorKey: 'start',
          header: '開始',
          enableGlobalFilter: false,
          size: TIME_WIDTH,
          // @ts-expect-error TS7031
          Cell: ({renderedCellValue}: { renderedCellValue: number }) => (
            <Stack justify="start" style={{height: '100%'}}>
              <div>{formatTime(renderedCellValue, true)}</div>
            </Stack>
          ),
        },
        {
          accessorKey: 'end',
          header: '終了',
          enableGlobalFilter: false,
          size: TIME_WIDTH,
          // @ts-expect-error TS7031
          Cell: ({renderedCellValue}: { renderedCellValue: number }) => (
            <Stack justify="start" style={{height: '100%'}}>
              <div>{formatTime(renderedCellValue, true)}</div>
            </Stack>
          ),
        },
        {
          accessorKey: 'text',
          header: 'テキスト',
          size: Math.max(TIME_WIDTH, parentWidth - ACTION_WIDTH - TIME_WIDTH * 2 - 12 - 1),
          Cell: ({renderedCellValue}) => (
            <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{renderedCellValue}</div>
          ),
        },
      ]
    ,
    [parentHeight, parentWidth],
  )

  useEffect(() => {
    if (!autoScroll) {
      return
    }
    const index = sequence.actions.findIndex((_text) => _text.id === currentTextId)
    if (index > -1) {
      rowVirtualizerInstanceRef.current.scrollToIndex(index, {align: 'start', behavior: 'smooth'})
    }
  }, [currentTextId, autoScroll])

  const table = useMantineReactTable({
    columns,
    data: sequence.actions,
    enableBottomToolbar: false,
    enableRowVirtualization: true,
    rowVirtualizerInstanceRef,
    rowVirtualizerOptions: {overscan: 10},
    initialState: {
      density: 'xs',
      showGlobalFilter: true,
    },
    mantinePaperProps: {
      style: {
        border: 'none',
      },
    },
    mantineTableContainerProps: {
      style: {
        height: `${parentHeight - 36}px`,
        maxHeight: `${parentHeight - 36}px`,
      },
    },
    mantineTableBodyRowProps: ({row}) => ({
      onClick: (e) => {
        if (!(e.target as HTMLElement).closest('button')) {
          onClick && onClick(row.original)
        }
      },
      style: {
        backgroundColor: row.original.id === currentTextId ? 'var(--mrt-row-hover-background-color)' : '',
      },
    }),
    // top toolbar
    enableColumnActions: false,
    enableDensityToggle: false,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    enableHiding: false,
    enableFullScreenToggle: false,
    enablePagination: false,
    enableSorting: false,
    renderTopToolbar: ({table}) => {
      return (
        <Group pl="xs" gap={0} justify="space-between" wrap="nowrap">
          <TextInput
            variant="filled"
            ref={nameInput}
            value={sequenceName}
            onChange={(e) => {
              setSequenceName(e.currentTarget.value)
            }}
            onFocus={() => {
              setSequenceNameTemp(sequenceName)
            }}
            onBlur={() => {
              let valid = true
              if (sequenceName.length === 0) {
                alert('シーケンスの名称を設定してください')
                valid = false
                setSequenceName(sequenceNameTemp)
              } else {
                sequence.name = sequenceName
              }
              if (valid) {
                _onChange()
              } else {
                setTimeout(() => {
                  nameInput.current?.focus()
                })
              }
            }}
            style={{width: '100%'}}
          />
          <Group p={0} style={{flexShrink: 0}}>
            <MRT_GlobalFilterTextInput table={table}/>
          </Group>
        </Group>
      )
    },
    mantineSearchTextInputProps: {
      placeholder: 'テキストを検索',
    },
    // Row actions
    enableRowActions: true,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        // @ts-expect-error TS2322
        header: (
          <ActionIcon
            variant={autoScroll ? 'filled' : 'default'}
            size="sm"
            radius="sm"
            onClick={() => setAutoScroll(v => !v)}
            title="再生時間に合わせて自動スクロール"
          >
            <IconArrowBigDownLines size={16} stroke={1.5}/>
          </ActionIcon>
        ),
        size: ACTION_WIDTH,
      },
    },
    renderRowActions: ({row}) => {
      return <ActionIcon
        variant="default"
        size="sm"
        radius="sm"
        onClick={() => {
          onSetTime(row.original.start)
        }}
      >
        <IconPlayerPlay size={16} stroke={1.0}/>
      </ActionIcon>
    },
    localization: MRT_Localization_JA,
  })

  return <MantineReactTable table={table}/>
}

export default SequenceTable
