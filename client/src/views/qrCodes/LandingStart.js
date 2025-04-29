// src/pages/LandingStart.jsx
import { useNavigate } from 'react-router-dom';
import VisitorCounter from '../../../src/components/Pages/VisitorCounter';

const LandingStart = () => {
  const navigate = useNavigate();

  const goToQuote = () => {
    navigate('/index?promoCode=start15', { state: { scrollToQuote: true } });
  };

  return (
    <>
      <VisitorCounter page={"start"} />

      <div className="container text-center py-5">
        <h1>Clean Starts Here — Toronto, Don’t Wait!</h1>
        <p>CleanAR Solutions is ready when you are. Tap below to take the first step.</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-primary" onClick={goToQuote}>Start Now</button>
          <a className="btn btn-info" href="tel:+14374405514">Call Now</a>
        </div>
      </div>
    </>
  );
};

export default LandingStart;