import React from 'react';
import './pages.css';

function BookNow() {
  return (
    <div className="container">
      <a
        href="https://radiantsoulesthetics.square.site/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <div className="book-now-bar">
          <span>Book Now</span>
        </div>
      </a>
      <p>Click here to book now!</p>
      {/* Other content in the BookNow component */}
    </div>
  );
}

export default BookNow;
