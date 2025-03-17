import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Play } from 'lucide-react-native';

interface LikedSong {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_title: string;
}

export default function LikedSongsScreen() {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);
  const { session } = useAuth();
  const { setCurrentSong } = useMusicPlayer();

  useEffect(() => {
    if (session?.user) {
      loadLikedSongs();
    }
  }, [session]);

  const loadLikedSongs = async () => {
    const { data, error } = await supabase
      .from('liked_songs')
      .select('*')
      .eq('user_id', session?.user.id)
      .order('liked_at', { ascending: false });

    if (data) {
      setLikedSongs(data);
    }
  };

  const playSong = (song: LikedSong) => {
    setCurrentSong({
      id: song.video_id,
      title: song.title,
      thumbnail: song.thumbnail,
      channelTitle: song.channel_title,
    });
  };

  if (!session?.user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Liked Songs</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Log in to see your liked songs</Text>
          <Text style={styles.emptyDescription}>
            Keep track of the music you love
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Liked Songs</Text>
      </View>

      <FlatList
        data={likedSongs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.songItem}
            onPress={() => playSong(item)}>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
            />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.artistName} numberOfLines={1}>
                {item.channel_title}
              </Text>
            </View>
            <View style={styles.playButton}>
              <Play size={20} color="#000" />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No liked songs yet</Text>
            <Text style={styles.emptyDescription}>
              Start liking songs to see them here
            </Text>
          </View>
        )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
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
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
  },
});