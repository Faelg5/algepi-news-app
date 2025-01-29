import React, { createContext, useState } from 'react';
import { isContentFilterEnabled } from '../screens/PreferencesScreen';
import { userControlEnabled } from '../screens/PreferencesScreen';
import { transparencyEnabled } from '../screens/PreferencesScreen';


const UserPreferencesContext = createContext<User | undefined>(undefined); // Create a new context for user preferences

export const UserPreferencesProvider = ({ children }) => {
const [selectedLanguageCode, setSelectedLanguageCode] = useState('fr');

  const [selectedThemes, setSelectedThemes] = useState([]); // Set default selected themes
  const [selectedCountry, setSelectedCountry] = useState('en');
  const [isContentFilterEnabled, setIsContentFilterEnabled] = useState();
  const [userControlEnabled, setUserControlEnabled] = useState();
  const [transparencyEnabled, setIsTransparencyEnabled] = useState();
  const [isSurveyModeEnabled, setIsSurveyModeEnabled] = useState();

  return (
    <UserPreferencesContext.Provider value={{ selectedThemes, setSelectedThemes, selectedCountry, setSelectedCountry, selectedLanguageCode, setSelectedLanguageCode, isContentFilterEnabled, setIsContentFilterEnabled, userControlEnabled, setUserControlEnabled, transparencyEnabled, setIsTransparencyEnabled, isSurveyModeEnabled, setIsSurveyModeEnabled}}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export default UserPreferencesContext;