import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Play, Pause, SkipBack, SkipForward, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useAuth } from '@/hooks/useAuth';

export default function MusicPlayer() {
  const { currentSong, isPlaying, setIsPlaying } = useMusicPlayer();
  const [isLiked, setIsLiked] = useState(false);
  const playerRef = useRef(null);
  const { session } = useAuth();

  const handleLikeToggle = async () => {
    if (!session?.user || !currentSong) return;

    try {
      if (isLiked) {
        await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', session.user.id)
          .eq('video_id', currentSong.id);
      } else {
        await supabase
          .from('liked_songs')
          .insert({
            user_id: session.user.id,
            video_id: currentSong.id,
            title: currentSong.title,
            thumbnail: currentSong.thumbnail,
            channel_title: currentSong.channelTitle,
          });
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!currentSong) return null;

  return (
    <LinearGradient
      colors={['rgba(18, 18, 18, 0.98)', '#121212']}
      style={styles.container}>
      <View style={styles.content}>
        <Image source={{ uri: currentSong.thumbnail }} style={styles.artwork} />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.channelTitle}</Text>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={handleLikeToggle}>
            <Heart
              size={24}
              color={isLiked ? '#1DB954' : '#fff'}
              fill={isLiked ? '#1DB954' : 'none'}
            />
          </Pressable>

          <View style={styles.playControls}>
            <Pressable style={styles.controlButton}>
              <SkipBack size={24} color="#fff" />
            </Pressable>
            
            <Pressable
              style={[styles.controlButton, styles.playButton]}
              onPress={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? (
                <Pause size={24} color="#000" />
              ) : (
                <Play size={24} color="#000" />
              )}
            </Pressable>
            
            <Pressable style={styles.controlButton}>
              <SkipForward size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playerContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={0}
          play={isPlaying}
          videoId={currentSong.id}
          onChangeState={(state) => {
            if (state === 'ended') {
              setIsPlaying(false);
            }
          }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
     bottom: 75, 
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#282828',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#fff',
  },
  playerContainer: {
    height: 0,
    overflow: 'hidden',
  },
});