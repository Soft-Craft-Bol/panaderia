import { useEffect, useState } from 'react';
import './Scrooll.css';

const ScrollToTop = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setLoading(false); 
    };

    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad); 
    };
  }, []);

  return (
    <>
      {loading && (
        <div className="loading">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </>
  );
};

export default ScrollToTop;