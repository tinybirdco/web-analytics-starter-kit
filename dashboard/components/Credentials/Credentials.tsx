import Modal from '../Modal'
import CredentialsForm from './CredentialsForm'

export default function Credentials() {
  return (
    <Modal isOpen>
      <Modal.Content>
        <Modal.Title>Enter credentials</Modal.Title>
        <Modal.Description>
          To visualize your analytics data in the pre-built dashboard, you need
          to specify a token with read access to the pipes, and your workspace
          Host.
        </Modal.Description>
        <CredentialsForm />
      </Modal.Content>
    </Modal>
  )
}
