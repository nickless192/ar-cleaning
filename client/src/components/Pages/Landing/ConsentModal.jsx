import React, {useState} from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ConsentModal({ show, onAccept, onReject }) {
    const [consentGiven, setConsentGiven] = useState(false);

    return (
    <Modal show={show} backdrop="static" centered>
      <Modal.Header>
        <Modal.Title>Consent Required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          To continue using your profile, we need your agreement to our{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          .
        </p>
        <Form.Check
          type="checkbox"
          id="consent-checkbox"
          label="I agree to the Terms and Privacy Policy"
          required
          onChange={(e) => setConsentGiven(e.target.checked)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onReject}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onAccept(consentGiven)}>
          Accept & Continue
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConsentModal;