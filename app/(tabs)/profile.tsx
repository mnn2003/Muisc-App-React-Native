import { View, Text, StyleSheet, Pressable, Image, TextInput } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import { supabase } from '@/lib/supabase';

interface Profile {
  username: string;
  avatar_url: string;
}

export default function ProfileScreen() {
  const { session } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

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
            setEditedName(newProfile.username);
          }
        }
        return;
      }

      if (data) {
        setProfile(data);
        setEditedName(data.username);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editedName,
          avatar_url: `https://api.dicebear.com/7.x/avatars/svg?seed=${encodeURIComponent(editedName)}`,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {session?.user && (
          <Pressable 
            style={styles.settingsButton}
            onPress={() => setIsEditing(!isEditing)}>
            <Settings size={24} color="#fff" />
          </Pressable>
        )}
      </View>

      {session?.user ? (
        <View style={styles.profile}>
          {profile && (
            <>
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Enter your name"
                    placeholderTextColor="#b3b3b3"
                  />
                  <Pressable
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </Pressable>
                </View>
              ) : (
                <Text style={styles.name}>{profile.username}</Text>
              )}
            </>
          )}
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>

          <Pressable
            style={styles.logoutButton}
            onPress={handleSignOut}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.promptTitle}>Enjoy Your Music</Text>
          <Text style={styles.promptDescription}>
            Login to create playlists, like songs, and follow artists
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => setShowAuthModal(true)}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </View>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profile: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#282828',
    color: '#fff',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#b3b3b3',
    marginTop: 4,
  },
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  promptDescription: {
    fontSize: 16,
    color: '#b3b3b3',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: '#282828',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});