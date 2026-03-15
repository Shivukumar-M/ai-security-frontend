// frontend/src/components/Loader.jsx
import React from 'react';

const Loader = () => {
  return (
    // Uses generic Tailwind classes since custom classes rely on global CSS
    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mx-auto" />
  );
};

export default Loader;