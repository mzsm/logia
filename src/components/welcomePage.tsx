import { Button, Divider, Group, Modal, noop, Stack, Text, Title } from '@mantine/core'
import { IconFileMusic, IconFolderOpen } from '@tabler/icons-react'
const CTRL_OR_COMMAND = window.electronAPI.isMac() ? '⌘' : 'Ctrl'

interface Props {
  opened: boolean
  onClickMediaOpen: () => unknown
  onClickProjectOpen: () => unknown
}

function WelcomePage({opened, onClickMediaOpen, onClickProjectOpen}: Props) {
  return (
    <Modal
      opened={opened}
      onClose={noop}
      closeOnClickOutside={false}
      withCloseButton={false}
      closeOnEscape={false}
      size="xl"
      overlayProps={{blur: 1}}
      trapFocus={false}
    >
      <Stack>
        <Title order={1} fw="normal">Welcome to Logia</Title>
        <Title order={2} fw="normal">Let's get started</Title>
        <Divider/>
        <Title order={3} fw="normal">Start New Project</Title>
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconFileMusic size={24} stroke={1.5}/>}
            rightSection={` (${CTRL_OR_COMMAND}+O)`}
            onClick={onClickMediaOpen}
          >
            メディアファイルを開く...
          </Button>
        </Group>
        <Title order={3} fw="normal">Edit Existing Project</Title>
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconFolderOpen size={24} stroke={1.5}/>}
            rightSection={`(${CTRL_OR_COMMAND}+P)`}
            onClick={onClickProjectOpen}
          >
            プロジェクトファイルを開く...
          </Button>
        </Group>
        <Divider/>
        <Text size="sm">またはウィンドウにメディア/プロジェクトファイルをドロップ</Text>
      </Stack>
    </Modal>
  )
}

export default WelcomePage
