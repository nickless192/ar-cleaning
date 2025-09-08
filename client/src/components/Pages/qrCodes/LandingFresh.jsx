import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../Management/VisitorCounter';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LandingFresh = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          {t('landing_fresh.title')}
        </motion.h1>

        <motion.p
          className="lead mt-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: '600px' }}
        >
          {t('landing_fresh.description')}
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
            {t('landing_fresh.buttons.book_clean')}
          </button>
          <a
            className="btn btn-outline-info btn-lg px-4 py-2 fw-semibold"
            href="tel:+14374405514"
          >
            {t('landing_fresh.buttons.call_now')}
          </a>
        </motion.div>

        <motion.p
          className="mt-5 text-muted fst-italic small"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t('landing_fresh.tagline')}
        </motion.p>
        <motion.p
                        className="text-muted small mt-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {t('landing_fresh.terms')}
                        <a href="/terms-conditions" className="ms-1">{t('landing_fresh.see_terms')}</a>
                      </motion.p>
      </div>
    </>
  );
};

export default LandingFresh;
