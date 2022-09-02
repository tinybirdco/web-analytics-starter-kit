import * as Dialog from '@radix-ui/react-dialog'

function ModalTitle(props: Dialog.DialogTitleProps) {
  return <Dialog.Title className="text-lg font-medium mb-2" {...props} />
}

function ModalDescription(props: Dialog.DialogDescriptionProps) {
  return <Dialog.Description className="text-sm mb-5" {...props} />
}

function ModalContent(props: Dialog.DialogContentProps) {
  return (
    <div className="fixed inset-0 z-10 grid place-content-center">
      <Dialog.Content
        className="bg-white rounded-xl h-auto w-full max-w-2xl mx-auto px-10 py-9 flex flex-col"
        {...props}
      />
    </div>
  )
}

type ModalProps = {
  children: React.ReactNode
  isOpen: boolean
}

function Modal({ children, isOpen }: ModalProps) {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      {children}
    </Dialog.Root>
  )
}

export default Object.assign(Modal, {
  Title: ModalTitle,
  Description: ModalDescription,
  Content: ModalContent,
})
