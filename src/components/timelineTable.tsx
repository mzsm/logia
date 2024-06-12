import { useMemo } from 'react'
import { Stack } from '@mantine/core'
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table'
import { MRT_Localization_JA } from 'mantine-react-table/locales/ja/index.cjs'
import { TranscriptionRow, TranscriptionText } from '../declare'
import { formatTime } from '../utils'

const TIME_WIDTH = 110

interface Props {
  timeline: TranscriptionRow
  parentHeight: number
  parentWidth: number
  onClick?: (TranscriptionText) => unknown
}

function TimelineTable({timeline, parentHeight, parentWidth, onClick}: Props) {
  const columns = useMemo<MRT_ColumnDef<TranscriptionText>[]>(
    () =>
      [
        {
          accessorKey: 'start',
          header: '開始',
          enableGlobalFilter: false,
          size: TIME_WIDTH,
          // @ts-expect-error TS7031
          Cell: ({renderedCellValue}: {renderedCellValue: number}) => (
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
          Cell: ({renderedCellValue}: {renderedCellValue: number}) => (
            <Stack justify="start" style={{height: '100%'}}>
              <div>{formatTime(renderedCellValue, true)}</div>
            </Stack>
          ),
        },
        {
          accessorKey: 'text',
          header: 'テキスト',
          size: Math.max(TIME_WIDTH, parentWidth - TIME_WIDTH * 2 - 1),
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
        border: 'none'
      }
    },
    mantineTableContainerProps: {
      style: {
        height: `${parentHeight - 56}px`,
        maxHeight: `${parentHeight - 56}px`,
      },
    },
    mantineTableBodyRowProps: ({row}) => ({
      onClick: () => {
        onClick && onClick(row.original)
      }
    }),
    localization: MRT_Localization_JA
  })

  return <MantineReactTable table={table}/>
}

export default TimelineTable
