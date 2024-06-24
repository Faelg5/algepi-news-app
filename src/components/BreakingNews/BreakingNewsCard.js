import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

const BreakingNewsCard = ({ label, data, getEmotionEmojis }) => {
  const renderItem = ({ item }) => {
    const [emojis, setEmojis] = React.useState("");

    React.useEffect(() => {
      const fetchEmojis = async () => {
        const result = await getEmotionEmojis(item.title);
        setEmojis(result);
      };
      fetchEmojis();
    }, [item.title]);

    return (
      <View style={styles.newsItem}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSummary}>{item.summary}</Text>
        <Text style={styles.newsEmojis}>{emojis}</Text>
      </View>
    );
  };

  return (
    <View>
      <Text style={styles.header}>{label}</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.url}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  newsItem: {
    marginBottom: 20,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  newsSummary: {
    fontSize: 16,
    marginVertical: 5,
  },
  newsEmojis: {
    fontSize: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default BreakingNewsCard;