import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { fetchTrendingMusic } from '@/lib/youtube';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface Profile {
  username: string;
  avatar_url: string;
}

export default function HomeScreen() {
  const [trendingMusic, setTrendingMusic] = useState<Song[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { session } = useAuth();
  const { setCurrentSong, setIsPlaying } = useMusicPlayer();

  useEffect(() => {
    const loadTrendingMusic = async () => {
      const music = await fetchTrendingMusic();
      setTrendingMusic(music);
    };
    loadTrendingMusic();
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', session?.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: session?.user.id,
              username: session?.user.email?.split('@')[0] || 'User',
              avatar_url: `https://api.dicebear.com/7.x/avatars/svg?seed=${session?.user.id}`,
            })
            .select()
            .single();

          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        }
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1DB954', '#121212']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          {profile && (
            <Text style={styles.username}>{profile.username}</Text>
          )}
        </View>
        
        <View style={styles.recentlyPlayed}>
          <Text style={styles.sectionTitle}>Recently played</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingMusic.map((song) => (
              <Pressable
                key={song.id}
                style={styles.songCard}
                onPress={() => handlePlaySong(song)}>
                <Image source={{ uri: song.thumbnail }} style={styles.songImage} />
                <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={styles.artistName} numberOfLines={1}>{song.channelTitle}</Text>
                <View style={styles.playButton}>
                  <Play size={24} color="#000" fill="#000" />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.madeForYou}>
          <Text style={styles.sectionTitle}>Made for you</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingMusic.slice(0, 5).map((song) => (
              <Pressable
                key={song.id}
                style={styles.playlistCard}
                onPress={() => handlePlaySong(song)}>
                <Image source={{ uri: song.thumbnail }} style={styles.playlistImage} />
                <Text style={styles.playlistTitle} numberOfLines={2}>{song.title}</Text>
                <Text style={styles.playlistDescription} numberOfLines={2}>
                  Based on your recent listening
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  gradient: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    color: '#fff',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  recentlyPlayed: {
    marginBottom: 32,
  },
  songCard: {
    width: 150,
    marginRight: 16,
    position: 'relative',
  },
  songImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  songTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  artistName: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    position: 'absolute',
    bottom: 45,
    right: 8,
    backgroundColor: '#1DB954',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  madeForYou: {
    marginBottom: 32,
  },
  playlistCard: {
    width: 180,
    marginRight: 16,
  },
  playlistImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  playlistDescription: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 4,
  },
});