import { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const WelcomeModal = () => {
  const [show, setShow] = useState(false);
  const [variant, setVariant] = useState('A'); // 'A' or 'B' for A/B testing
  const navigate = useNavigate();
  const { t } = useTranslation();


  useEffect(() => {
    const dismissed = localStorage.getItem('welcomeBackModalDismissed');
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
    localStorage.setItem('welcomeBackModalDismissed', 'true');
    setShow(false);
  };

  const handleQuoteClick = (e) => {
    // trackEvent('quote_clicked');
    // navigate('/index?promoCode=welcome15', { state: { scrollToQuote: true } }); 
    // localStorage.setItem('welcomeModalDismissed', 'true');
    navigate('/index?promoCode=refresh15&scrollToQuote=true');    
    // refresh
    // window.location.reload();
    setShow(false);
  };

  const handleProductsAndServicesClick = () => {
    // trackEvent('products_and_services_clicked');
    navigate('/products-and-services');
    setShow(false);
  }

  const trackEvent = (action) => {
    const event = {
      action,
      variant,
      timestamp: new Date().toISOString(),
    };
    // console.log('Modal Event Tracked:', event);
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
      <Modal.Header closeButton className='light-blue-bg-color text-center' >
        <Modal.Title>{t("welcome_modal.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className='text-center' style={{ backgroundColor: 'var(--light-color-opaque)' }}>
        <p>{t("welcome_modal.description")}</p>
        {variant === 'A' ? (
          <p>
            <strong>
              {t("welcome_modal.variant_a")}
            </strong>
          </p>
        ) : (
          <p className="text-center">
            <strong>
            {t("welcome_modal.variant_b")}
            </strong>
          </p>
        )}
        <div className="d-flex flex-column flex-md-row justify-content-between mt-3">
          <Button
            variant="success"
            onClick={handleQuoteClick}
            data-track="quote_clicked_modal"
            className="secondary-bg-color px-2 mx-1"
          >
            {t("welcome_modal.buttons.start_quote")}
          </Button>
          <Button
            variant="info"
            data-track="explore_services_modal"
            className='px-2 mx-1'
            onClick={handleClose}
          >
            {t("welcome_modal.buttons.explore_services")}
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer className='py-2 justify-content-center' style={{ backgroundColor: 'var(--light-color-opaque)!important' }}>
        <Button variant="danger" onClick={handleDontShowAgain} data-track="dont_show_again_modal">
          {t("welcome_modal.buttons.dont_show_again")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
