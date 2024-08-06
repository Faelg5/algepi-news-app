import React, { createContext, useState } from 'react';

const UserPreferencesContext = createContext<User | undefined>(undefined); // Create a new context for user preferences

export const UserPreferencesProvider = ({ children }) => {
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('US');

  return (
    <UserPreferencesContext.Provider value={{ selectedThemes, setSelectedThemes, selectedCountry, setSelectedCountry }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;