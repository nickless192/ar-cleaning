// src/pages/LandingSecret.jsx
import { useNavigate } from 'react-router-dom';

const LandingSecret = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index', { state: { scrollToQuote: true } });
  };

  return (
    <div className="container text-center py-5">
      <h1>The Clean Secret Everyone’s Talking About… 👇</h1>
      <p>Discover why Toronto trusts CleanAR Solutions. Book your transformation today.</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary" onClick={goToQuote}>Reveal the Secret</button>
        <a className="btn btn-outline-secondary" href="tel:+14374405514">Call Now</a>
      </div>
    </div>
  );
};

export default LandingSecret;