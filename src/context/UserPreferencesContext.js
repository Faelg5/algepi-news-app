import React, { createContext, useState } from 'react';

const UserPreferencesContext = createContext<User | undefined>(undefined); // Create a new context for user preferences

export default UserPreferencesContext = ({ children }) => {
  const [selectedThemes, setSelectedThemes] = useState(["technology", "science", "health"]);
  const [selectedCountry, setSelectedCountry] = useState('US');

  return (
    <UserPreferencesContext.Provider value={{ selectedThemes: selectedThemes, setSelectedThemes, selectedCountry, setSelectedCountry }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
