import React from 'react';
import { ClipLoader } from 'react-spinners';

function LoadingSpinner({ size = 50, color = '#00aa9d', containerStyle = {} }) {
  const defaultStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px',
    width: '100%',
    minHeight: '200px',
  };

  const combinedStyle = { ...defaultStyle, ...containerStyle };

  return (
    <div style={combinedStyle}>
      <ClipLoader color={color} size={size} />
    </div>
  );
}

export default LoadingSpinner; 