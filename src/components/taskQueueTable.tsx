import { ActionIcon, Group, Loader, Table, ThemeIcon } from '@mantine/core'
import { TranscriptionTask } from '../declare'
import { formatTime } from '../utils'
import { ReactNode, useEffect, useState } from 'react'
import {
  IconBan,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconClockHour3,
  IconMinus,
  IconX,
} from '@tabler/icons-react'

interface Props {
  queue: TranscriptionTask[]
  onUpdated: (queue: TranscriptionTask[]) => unknown
}

const statusLabel: { [status: number]: ReactNode } = {
  0: <><IconClockHour3 size={16} stroke={1.5}/><span>待機中</span></>,
  1: <><Loader size={16}/><span>処理中</span></>,
  2: <><ThemeIcon radius="xl" size={16} color="green"><IconCheck size={14} stroke={2}/></ThemeIcon><span>完了</span></>,
  3: <><ThemeIcon radius="xl" size={16} color="red"><IconMinus size={16} stroke={2}/></ThemeIcon><span>中止</span></>,
}

const TaskQueueTable = ({queue, onUpdated}: Props) => {
  const [processing, setProcessing] = useState<number[]>([])

  useEffect(() => {
    setProcessing(queue.map((task, index) => task.status === 1 ? index : -1).filter((index) => index !== -1))
  }, [queue])

  return (
    <Table.ScrollContainer minWidth={300}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>From</Table.Th>
            <Table.Th>To</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {
            queue.map((task, index) => (
              <Table.Tr key={index}>
                <Table.Td>{task.params.start ? formatTime(task.params.start) : '-'}</Table.Td>
                <Table.Td>{task.params.end ? formatTime(task.params.end) : '-'}</Table.Td>
                <Table.Td><Group justify="flex-startl" align="center" gap="xs" m={0}>{statusLabel[task.status]}</Group></Table.Td>
                <Table.Td>
                  <Group wrap="nowrap" gap="xs">
                    {
                      task.status === 1 ?
                        <ActionIcon
                          size="sm" color="red" variant="outline"
                          onClick={() => {
                            if (confirm('進行中の自動文字起こしを中止してよろしいですか?')) {
                              window.electronAPI.abortTranscription(task.params.id)
                            }
                          }}
                        >
                          <IconBan size={16} stroke={1.5}/>
                        </ActionIcon> :
                        <ActionIcon
                          size="sm" color="red" variant="outline"
                          onClick={() => {
                            queue.splice(index, 1)
                            onUpdated(queue)
                          }}
                        >
                          <IconX size={16} stroke={1.5}/>
                        </ActionIcon>
                    }
                    {
                      task.status === 0 ?
                        <ActionIcon.Group>
                          <ActionIcon
                            size="sm" color="gray" variant="outline"
                            disabled={processing.includes(index - 1)}
                            onClick={() => {
                              queue.splice(index - 1, 2, ...[queue[index], queue[index - 1]])
                              onUpdated(queue)
                            }}
                          >
                            <IconChevronUp size={16} stroke={1.5}/>
                          </ActionIcon>
                          <ActionIcon
                            size="sm" color="gray" variant="outline"
                            disabled={index === queue.length - 1}
                            onClick={() => {
                              queue.splice(index, 2, ...[queue[index + 1], queue[index]])
                              onUpdated(queue)
                            }}
                          >
                            <IconChevronDown size={16} stroke={1.5}/>
                          </ActionIcon>
                        </ActionIcon.Group> :
                        <></>
                    }
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          }
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}

export default TaskQueueTable
