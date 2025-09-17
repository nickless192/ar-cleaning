import React from 'react';
// import './NewIconAnimated.css';

const NewIconAnimated = ({ className = '' }) => {
  return (
    <sup className={`new-badge-animated ${className}`}>
      NEW
    </sup>
  );
};

export default NewIconAnimated;