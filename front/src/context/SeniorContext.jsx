import React, { createContext, useContext, useState, useEffect } from 'react';

const SeniorContext = createContext();

export function SeniorProvider({ children }) {
  const [seniorMode, setSeniorMode] = useState(false);

  useEffect(() => {
    if (seniorMode) {
      document.body.classList.add('senior-mode');
    } else {
      document.body.classList.remove('senior-mode');
    }
  }, [seniorMode]);

  const toggleSeniorMode = () => {
    setSeniorMode((prev) => !prev);
  };

  return (
    <SeniorContext.Provider value={{ seniorMode, toggleSeniorMode }}>
      {children}
    </SeniorContext.Provider>
  );
}

export function useSenior() {
  const context = useContext(SeniorContext);
  if (!context) {
    throw new Error('useSenior deve ser utilizado dentro de um SeniorProvider');
  }
  return context;
}
