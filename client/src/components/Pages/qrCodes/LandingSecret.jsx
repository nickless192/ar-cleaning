import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../Management/VisitorCounter';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';


const LandingSecret = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
            {t('landing_secret.title')}
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
            {t('landing_secret.description')}
          </p>
          <p className="mt-3 text-dark fw-semibold">
            <em>{t('landing_secret.tagline')}</em>
          </p>
        </motion.div>

        <motion.div
          className="d-flex flex-column flex-md-row justify-content-center gap-3 mt-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button className="btn btn-primary btn-lg px-4" onClick={goToQuote}>
            {t('landing_secret.buttons.reveal_secret')}
          </button>
          <a className="btn btn-outline-info btn-lg px-4" href="tel:+14374405514">
            {t('landing_secret.buttons.call_now')}
          </a>
        </motion.div>
        <motion.p
                className="text-muted small mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('landing_secret.terms')}
                <a href="/terms-conditions" className="ms-1">{t('landing_secret.see_terms')}</a>
              </motion.p>
      </div>
    </>
  );
};

export default LandingSecret;
