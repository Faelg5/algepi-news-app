import React, { createContext, useState } from "react";

export const UserHistoryContext = createContext();

export const UserHistoryProvider = ({ children }) => {
  const [clickedTopics, setClickedTopics] = useState([
    { topic: "technology", timestamp: "2025-04-09T10:15:00.000Z" },
    { topic: "finance", timestamp: "2025-04-12T10:20:00.000Z" },
    { topic: "news", timestamp: "2025-04-03T10:30:00.000Z" },
    { topic: "space", timestamp: "2025-03-25T11:00:00.000Z" },
    { topic: "climate", timestamp: "2025-03-25T11:15:00.000Z" },
  ]);

  // Ajouter un topic à l'historique
  const addTopicToHistory = (topic) => {
    const timestamp = new Date().toISOString(); // Ajoute la date du clic
    setClickedTopics((prevTopics) => [...prevTopics, { topic, timestamp }]);
    console.log("🧠 Added topic to history:", topic);
  };

  return (
    <UserHistoryContext.Provider value={{ clickedTopics, addTopicToHistory }}>
      {children}
    </UserHistoryContext.Provider>
  );
};