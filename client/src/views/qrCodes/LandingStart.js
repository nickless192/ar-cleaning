import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../../../src/components/Pages/VisitorCounter';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';

const LandingStart = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index?promoCode=start15', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page="start" />

      <div
        style={{
          background: 'linear-gradient(to right, #ffffff, #f1f8ff)',
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
                Your Clean Start Begins Now ✨
              </motion.h1>

              <motion.p
                className="lead text-muted mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2 }}
              >
                CleanAR Solutions is ready when you are. Book in under 60 seconds or call us for expert advice.
              </motion.p>

              <motion.div
                className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <Button variant="success" size="lg" onClick={goToQuote}>
                  Start My Free Quote And Get 15% Off* 🚀
                </Button>
                <Button variant="outline-primary" size="lg" href="tel:+14374405514">
                  Talk to an Expert 📞
                </Button>
              </motion.div>
              <motion.p
                className="text-muted small mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                *15% off for first-time customers only. Not valid with other offers.
                <a href="/terms-conditions" className="ms-1">See terms.</a>
              </motion.p>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default LandingStart;
