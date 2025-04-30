import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../../../src/components/Pages/VisitorCounter';
import { motion } from 'framer-motion';

const LandingNow = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index?promoCode=now15', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page="now" />

      <div
        className="container-fluid d-flex flex-column justify-content-center align-items-center text-center py-5"
        style={{
          background: 'radial-gradient(circle at top left, #0d6efd, #0dcaf0)',
          color: '#fff',
          minHeight: '100vh',
        }}
      >
        <motion.h1
          className="display-3 fw-bold"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          🚨 Toronto, We’ve Got a Clean Emergency!
        </motion.h1>

        <motion.p
          className="lead mt-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ maxWidth: '700px' }}
        >
          Spills, stains, and surprise guests? Don’t stress it — <strong>CleanAR Solutions</strong> delivers same-day shine! Get your instant quote and let’s get scrubbing.
        </motion.p>

        <motion.div
          className="d-flex flex-column flex-md-row justify-content-center gap-4 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <button
            className="btn btn-warning btn-lg fw-bold px-4 py-2"
            onClick={goToQuote}
          >
            Get Clean Now and Get 15% Off* 🧼
          </button>
          <a
            className="btn btn-outline-light btn-lg fw-bold px-4 py-2"
            href="tel:+14374405514"
          >
            Speak to a Cleaner 📞
          </a>
        </motion.div>

        <motion.p
          className="mt-5 fst-italic fw-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          "Trusted Clean, Trusted Service" – because you deserve nothing less.
        </motion.p>
        <motion.p
                        className="text-muted small mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        *15% off for first-time customers only. Not valid with other offers.
                        <a href="/terms-conditions" className="ms-1">See terms.</a>
                      </motion.p>
      </div>
    </>
  );
};

export default LandingNow;
