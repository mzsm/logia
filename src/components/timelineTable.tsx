import { useEffect, useMemo, useRef } from 'react'
import { ActionIcon, Stack } from '@mantine/core'
import { IconPlayerPlay } from '@tabler/icons-react'
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table'
import { MRT_Localization_JA } from 'mantine-react-table/locales/ja/index.cjs'
import { TranscriptionRow, TranscriptionText } from '../declare'
import { formatTime } from '../utils'

const TIME_WIDTH = 110
const ACTION_WIDTH = 40

interface Props {
  timeline: TranscriptionRow
  currentTextId?: string
  parentHeight: number
  parentWidth: number
  onClick?: (TranscriptionText) => unknown
  onSetTime?: (time: number) => unknown
}

function TimelineTable({timeline, currentTextId, parentHeight, parentWidth, onClick, onSetTime}: Props) {

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
          size: Math.max(TIME_WIDTH, parentWidth - ACTION_WIDTH - TIME_WIDTH * 2 - 1),
          // @ts-expect-error TS7031
          Cell: ({renderedCellValue}) => (
            <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{renderedCellValue}</div>
          ),
        },
      ]
    ,
    [parentHeight, parentWidth],
  )

  const table = useMantineReactTable({
    columns,
    data: timeline.actions,
    enableBottomToolbar: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableSorting: false,
    enableHiding: false,
    enableRowVirtualization: true,
    rowVirtualizerOptions: {overscan: 10},
    initialState: {density: 'xs'},
    mantinePaperProps: {
      style: {
        border: 'none',
      },
    },
    mantineTableContainerProps: {
      style: {
        height: `${parentHeight - 56}px`,
        maxHeight: `${parentHeight - 56}px`,
      },
    },
    mantineTableBodyRowProps: ({row}) => ({
      onClick: (e) => {
        if (!(e.target as HTMLElement).closest('button')) {
          onClick && onClick(row.original)
        }
      },
      style: {
        backgroundColor: row.original.id === currentTextId ? 'var(--mrt-row-hover-background-color)' : ''
      }
    }),
    // Row actions
    enableRowActions: true,
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: '',
        size: ACTION_WIDTH,
      },
    },
    renderRowActions: ({row}) => {
      return <ActionIcon
        variant="default"
        size="sm"
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

export default TimelineTable
