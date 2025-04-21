// src/pages/LandingToronto.jsx
import { useNavigate } from 'react-router-dom';

const LandingToronto = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index', { state: { scrollToQuote: true } });
  };

  return (
    <div className="container text-center py-5">
      <h1>Spotted in Toronto: Cleaner Spaces 👉</h1>
      <p>Join hundreds of Torontonians choosing CleanAR for a spotless experience.</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary" onClick={goToQuote}>Get a Quote</button>
        <a className="btn btn-outline-secondary" href="tel:+14374405514">Call Now</a>
      </div>
    </div>
  );
};

export default LandingToronto;