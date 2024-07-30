// src/context/XaiModeContext.js
import React, { createContext, useContext, useState } from 'react';

// Create a Context for the xaiMode
const XaiModeContext = createContext();

export const XaiModeProvider = ({ children }) => {
  // Create a state to hold the xaiMode value
  const [xaiMode, setXaiMode] = useState(true);

  return (
    <XaiModeContext.Provider value={{ xaiMode, setXaiMode }}>
      {children}
    </XaiModeContext.Provider>
  );
};

// Custom hook to use the XaiMode context
export const useXaiMode = () => {
  return useContext(XaiModeContext);
};