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

  const handleQuoteClick = (e) => {
    trackEvent('quote_clicked');
    // navigate('/index?promoCode=welcome15', { state: { scrollToQuote: true } }); 
    // localStorage.setItem('welcomeModalDismissed', 'true');
    navigate('/index?promoCode=welcome15&scrollToQuote=true');    
    // refresh
    // window.location.reload();
    setShow(false);
  };

  const handleProductsAndServicesClick = () => {
    trackEvent('products_and_services_clicked');
    navigate('/products-and-services');
    setShow(false);
  }

  const trackEvent = (action) => {
    const event = {
      action,
      variant,
      timestamp: new Date().toISOString(),
    };
    console.log('Modal Event Tracked:', event);
    // Optional: Send event to backend or analytics tool
    fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    })
      .then((response) => response.json())
      .then((data) => console.log('Event logged:', data))
      .catch((error) => console.error('Error logging event:', error));
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      centered
      className="welcome-modal"
    >
      <Modal.Header closeButton className='light-blue-bg-color py-0' >
        <Modal.Title>Welcome to CleanAR Solutions!</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: 'var(--light-color-opaque)' }}>
        <p>We’re thrilled to have you. Let us make your space sparkle ✨</p>
        {variant === 'A' ? (
          <p>
            <strong>
              New with us? Use promo code{' '}
              <span className='primary-color'>WELCOME15</span> for 15% off!
            </strong>
          </p>
        ) : (
          <p className="text-center">
            💥 First-time customer? Use <span className='primary-color'>WELCOME15</span> for a 15% discount on your first clean!
          </p>
        )}
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mt-3">
          <Button
            variant="success"
            onClick={handleQuoteClick}
            className="secondary-bg-color"
          >
            Start Now, Get a Quote ✨
          </Button>
          <Button
            variant="info"
            onClick={handleProductsAndServicesClick}
          >
            Not sure yet? Explore our services 🔎
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer className='py-2 justify-content-center' style={{ backgroundColor: 'var(--light-color-opaque)!important' }}>
        <Button variant="danger" onClick={handleDontShowAgain}>
          Don't show this again
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
