import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

function MessageCell({ message }) {
  const [showModal, setShowModal] = useState(false);

  const preview = message.length > 80 ? message.slice(0, 80) + "..." : message;

  return (
    <>
      <span
        style={{ cursor: "pointer", color: "#0d6efd" }}
        onClick={() => setShowModal(true)}
      >
        {preview}
      </span>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Full Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MessageCell;
