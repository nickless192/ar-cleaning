import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const WelcomeModal = () => {
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState('A'); // 'A' or 'B' for A/B testing
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = localStorage.getItem('welcomeModalDismissed');
    if (!dismissed) {
      const savedVariant = localStorage.getItem('welcomeModalVariant');
      const chosenVariant = savedVariant || (Math.random() > 0.5 ? 'A' : 'B');
      localStorage.setItem('welcomeModalVariant', chosenVariant);
      setVariant(chosenVariant);
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    // localStorage.setItem('welcomeModalDismissed', 'true');
    setShow(false);
  };

  const handleDontShowAgain = () => {
    localStorage.setItem('welcomeModalDismissed', 'true');
    setShow(false);
  };

  const handleQuoteClick = () => {
    trackEvent('quote_clicked');
    navigate('/index?promoCode=welcome15', { state: { scrollToQuote: true } });
  };

  const handleContactClick = () => {
    trackEvent('contact_clicked');
    navigate('/contact');
  };

  const trackEvent = (action) => {
    const event = {
      action,
      variant,
      timestamp: new Date().toISOString(),
    };
    console.log('Modal Event Tracked:', event);
    // Optional: Send event to backend or analytics tool
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      centered
      className="welcome-modal"
    >
      <Modal.Header closeButton style={{ backgroundColor: 'var(--light-blue-color)' }}>
        <Modal.Title>Welcome to CleanAR Solutions!</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: 'var(--light-color-opaque)' }}>
        <p>We’re thrilled to have you. Let us make your space sparkle ✨</p>
        <p>
          <strong>
            New here? Use promo code{' '}
            <span style={{ color: 'var(--primary-color)' }}>WELCOME15</span> for 15% off!
          </strong>
        </p>
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-3">
          <Button
            variant="success"
            onClick={handleQuoteClick}
            style={{ backgroundColor: 'var(--secondary-color)', border: 'none' }}
          >
            Get a Quote
          </Button>
          <Button
            variant="info"
            onClick={handleContactClick}
            style={{ backgroundColor: 'var(--accent-color)', border: 'none' }}
          >
            Message Us
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: 'var(--light-color-opaque)' }}>
        <Button variant="outline-secondary" onClick={handleDontShowAgain}>
          Don't show this again
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
