import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, Image, Pressable } from 'react-native';
import { Search as SearchIcon } from 'lucide-react-native';
import { searchMusic } from '@/lib/youtube';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const { setCurrentSong, setIsPlaying } = useMusicPlayer();

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      const searchResults = await searchMusic(text);
      setResults(searchResults);
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const renderItem = ({ item }: { item: Song }) => (
    <Pressable style={styles.resultItem} onPress={() => handlePlaySong(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artistName}>{item.channelTitle}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#b3b3b3" />
          <TextInput
            style={styles.input}
            placeholder="What do you want to listen to?"
            placeholderTextColor="#b3b3b3"
            value={query}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.results}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  results: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  songInfo: {
    marginLeft: 12,
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 4,
  },
});