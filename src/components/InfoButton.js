import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function InfoButton({ label }) {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  return (
    <TouchableOpacity onPress={toggleInfo} style={styles.container}>
      <Text style={styles.infoText}>i</Text>
      {showInfo && <Text style={styles.additionalText}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    color: 'gray',
    marginLeft: 5,
    fontFamily: 'Helvetica-Bold',
  },
  additionalText: {
    marginTop: 5,
    fontSize: 14,
    color: 'black',
    fontFamily: 'Helvetica',
  },
});
