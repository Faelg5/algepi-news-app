import React, { createContext, useState } from 'react';

const UserPreferencesContext = createContext<User | undefined>(undefined); // Create a new context for user preferences

export const UserPreferencesProvider = ({ children }) => {
const [selectedLanguageCode, setSelectedLanguageCode] = useState('fr');

  const [selectedThemes, setSelectedThemes] = useState([]); // Set default selected themes
  const [selectedCountry, setSelectedCountry] = useState('en');

  return (
    <UserPreferencesContext.Provider value={{ selectedThemes, setSelectedThemes, selectedCountry, setSelectedCountry, selectedLanguageCode, setSelectedLanguageCode }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;