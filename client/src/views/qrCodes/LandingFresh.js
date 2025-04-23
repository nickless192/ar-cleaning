// src/pages/LandingFresh.jsx
import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../../../src/components/Pages/VisitorCounter';

const LandingFresh = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page={"fresh"} />

      <div className="container text-center py-5">
        <h1>Tap In for a Fresher Space 🧼✨</h1>
        <p>Your clean oasis is just a click away. Let's refresh your space together.</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-primary" onClick={goToQuote}>Book a Clean</button>
          <a className="btn-info" href="tel:+14374405514">Call Now</a>
        </div>
      </div>
    </>
  );
};

export default LandingFresh;