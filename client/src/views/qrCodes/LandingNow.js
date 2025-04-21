// src/pages/LandingNow.jsx
import { useNavigate } from 'react-router-dom';

const LandingNow = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index', { state: { scrollToQuote: true } });
  };

  return (
    <div className="container text-center py-5">
      <h1>Toronto! Need a Clean-Up, Fast? 🧽</h1>
      <p>Your fresh start is one click away. Get an instant quote or speak with our team now.</p>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary" onClick={goToQuote}>Get a Quote</button>
        <a className="btn btn-outline-secondary" href="tel:+14374405514">Call Now</a>
      </div>
    </div>
  );
};

export default LandingNow;
