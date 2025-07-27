import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../Management/VisitorCounter';
import { motion } from 'framer-motion';

const LandingSecret = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index?promoCode=secret15', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page="secret" />

      <div className="container text-center py-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="display-5 fw-bold mb-3">
            The Clean Secret <span className="text-primary">Everyone’s Talking About…</span> 👇
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Unlock spotless spaces with <strong>CleanAR Solutions</strong> — Toronto’s most trusted for premium carpet, upholstery, and deep cleaning.
          </p>
          <p className="mt-3 text-dark fw-semibold">
            <em>"Trusted Clean, Trusted Service."</em>
          </p>
        </motion.div>

        <motion.div
          className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button className="btn btn-primary btn-lg px-4" onClick={goToQuote}>
            Reveal the Secret and Get 15% Off!* 🔑
          </button>
          <a className="btn btn-outline-info btn-lg px-4" href="tel:+14374405514">
            Call Now
          </a>
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
      </div>
    </>
  );
};

export default LandingSecret;
