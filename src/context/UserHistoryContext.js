import React, { createContext, useState } from "react";

export const UserHistoryContext = createContext();

export const UserHistoryProvider = ({ children }) => {
  const [clickedTopics, setClickedTopics] = useState([]);

  // Ajouter un topic à l'historique
  const addTopicToHistory = (topic) => {
    const timestamp = new Date().toISOString(); // Ajoute la date du clic
    setClickedTopics((prevTopics) => [...prevTopics, { topic, timestamp }]);
    console.log("added topic to history:", topic);
  };
  

  return (
    <UserHistoryContext.Provider value={{ clickedTopics, addTopicToHistory }}>
      {children}
    </UserHistoryContext.Provider>
  );
};