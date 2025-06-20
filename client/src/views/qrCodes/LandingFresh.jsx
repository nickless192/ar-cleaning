import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../../components/Pages/VisitorCounter';
import { motion } from 'framer-motion';

const LandingFresh = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index?promoCode=fresh15', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page="fresh" />

      <div
        className="container-fluid d-flex flex-column justify-content-center align-items-center text-center px-3 py-5"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom right, #e0f7fa, #ffffff)',
          color: '#004d40',
        }}
      >
        <motion.h1
          className="display-5 fw-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Tap In for a Fresher Space 🧼✨
        </motion.h1>

        <motion.p
          className="lead mt-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: '600px' }}
        >
          Your clean oasis is just a click away. Let's refresh your space together with
          <strong> CleanAR Solutions</strong>.
        </motion.p>

        <motion.div
          className="d-flex flex-column flex-sm-row gap-3 justify-content-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            className="btn btn-success btn-lg px-4 py-2 fw-semibold"
            onClick={goToQuote}
          >
            Book a Clean and Get 15% Off!* 🔥
          </button>
          <a
            className="btn btn-outline-info btn-lg px-4 py-2 fw-semibold"
            href="tel:+14374405514"
          >
            Call Now
          </a>
        </motion.div>

        <motion.p
          className="mt-5 text-muted fst-italic small"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Trusted Clean, Trusted Service — Serving Toronto with pride.
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

export default LandingFresh;
