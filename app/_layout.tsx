import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { MusicPlayerProvider } from '@/contexts/MusicPlayerContext';
import MusicPlayer from '@/components/MusicPlayer';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <MusicPlayerProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <MusicPlayer />
    </MusicPlayerProvider>
  );
}