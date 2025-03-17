import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface LikedSong {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_title: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
}

export default function LibraryScreen() {
  const { session } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);

  useEffect(() => {
    if (session?.user) {
      loadPlaylists();
      loadLikedSongs();
    }
  }, [session]);

  const loadPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const loadLikedSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('liked_songs')
        .select('*')
        .eq('user_id', session?.user.id)
        .order('liked_at', { ascending: false });

      if (error) throw error;
      if (data) setLikedSongs(data);
    } catch (error) {
      console.error('Error loading liked songs:', error);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('playlists')
        .insert({
          user_id: session.user.id,
          name: playlistName,
          description: playlistDescription,
        });

      if (error) throw error;

      setShowCreateModal(false);
      setPlaylistName('');
      setPlaylistDescription('');
      loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Library</Text>
        <Pressable 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}>
          <Plus size={24} color="#fff" />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {session?.user ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Liked Songs</Text>
              <View style={styles.likedSongs}>
                {likedSongs.map((song) => (
                  <View key={song.id} style={styles.songItem}>
                    <Image source={{ uri: song.thumbnail }} style={styles.thumbnail} />
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
                      <Text style={styles.artistName} numberOfLines={1}>{song.channel_title}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Playlists</Text>
              <View style={styles.playlists}>
                {playlists.map((playlist) => (
                  <View key={playlist.id} style={styles.playlistItem}>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                    {playlist.description && (
                      <Text style={styles.playlistDescription}>{playlist.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Create your first playlist</Text>
            <Text style={styles.emptyDescription}>Log in to create and manage playlists</Text>
          </View>
        )}
      </ScrollView>

      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Playlist</Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#fff" />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Playlist name"
              placeholderTextColor="#b3b3b3"
              value={playlistName}
              onChangeText={setPlaylistName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#b3b3b3"
              value={playlistDescription}
              onChangeText={setPlaylistDescription}
              multiline
              numberOfLines={4}
            />

            <Pressable
              style={styles.createPlaylistButton}
              onPress={handleCreatePlaylist}>
              <Text style={styles.buttonText}>Create</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  likedSongs: {
    gap: 12,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 8,
  },
  thumbnail: {
    width: 48,
    height: 48,
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
  playlists: {
    gap: 12,
  },
  playlistItem: {
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 8,
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playlistDescription: {
    color: '#b3b3b3',
    fontSize: 14,
    marginTop: 4,
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
    marginBottom: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#282828',
    width: '90%',
    borderRadius: 8,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  input: {
    backgroundColor: '#121212',
    color: '#fff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createPlaylistButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});