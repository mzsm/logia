import { useMemo } from 'react'
import { Stack } from '@mantine/core'
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table'
import { TranscriptionRow, TranscriptionText } from '../declare'
import { formatTime } from '../utils'

interface Props {
  timeline: TranscriptionRow
  parentHeight: number
}

function TimelineTable({timeline, parentHeight}: Props) {
  const columns = useMemo<MRT_ColumnDef<TranscriptionText>[]>(
    () =>
      [
        {
          accessorKey: 'start',
          header: '開始',
          enableGlobalFilter: false,
          size: 110,
          // @ts-expect-error TS7031
          Cell: ({renderedCellValue}) => (
            <Stack justify="start" style={{height: '100%'}}>
              <div>{formatTime(renderedCellValue, true)}</div>
            </Stack>
          ),
        },
        {
          accessorKey: 'end',
          header: '終了',
          enableGlobalFilter: false,
          size: 110,
          // @ts-expect-error TS7031
          Cell: ({renderedCellValue}) => (
            <Stack justify="start" style={{height: '100%'}}>
              <div>{formatTime(renderedCellValue, true)}</div>
            </Stack>
          ),
        },
        {
          accessorKey: 'text',
          header: 'テキスト',
          mantineTableBodyCellProps: {
            style: {
              alignItems: 'top',
            },
          },
        },
      ]
    ,
    [],
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
    enableRowVirtualization: () => timeline.actions.length >= 100,
    rowVirtualizerOptions: {overscan: 10},
    initialState: {density: 'xs'},
    mantineTableProps: {
      sx: {
        tableLayout: 'fixed'
      }
    },
    mantineTableContainerProps: {
      style: {
        height: `${parentHeight - 56}px`,
        maxHeight: `${parentHeight - 56}px`,
      },
    },
    mantineSearchTextInputProps: {
      placeholder: '検索',
    },
  })

  return <MantineReactTable table={table}/>
}

export default TimelineTable
