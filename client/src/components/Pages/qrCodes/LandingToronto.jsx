import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../Management/VisitorCounter';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LandingToronto = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goToQuote = () => {
    navigate('/index?promoCode=toronto15', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page="toronto" />

      <div
        style={{
          background: 'linear-gradient(to right, #f8f9fa, #e8f0ff)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '4rem',
          paddingBottom: '4rem',
        }}
      >
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <motion.h1
                className="display-4 fw-bold mb-3"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                {t('landing_toronto.title')}
              </motion.h1>

              <motion.p
                className="lead text-muted mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
              >
                {t('landing_toronto.description')}
              </motion.p>

              <motion.div
                className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <Button variant="primary" size="lg" onClick={goToQuote}>
                  {t('landing_toronto.buttons.fast_quote')}
                </Button>
                <Button variant="outline-info" size="lg" href="tel:+14374405514">
                  {t('landing_toronto.buttons.speak_expert')}
                </Button>
              </motion.div>
              <motion.p
                className="text-muted small mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('landing_toronto.terms')}
                <a href="/terms-conditions" className="ms-1">{t('landing_toronto.see_terms')}</a>
              </motion.p>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default LandingToronto;
