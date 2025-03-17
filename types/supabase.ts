export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          video_id: string
          title: string
          thumbnail: string
          channel_title: string
          added_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          video_id: string
          title: string
          thumbnail: string
          channel_title: string
          added_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          video_id?: string
          title?: string
          thumbnail?: string
          channel_title?: string
          added_at?: string
        }
      }
      liked_songs: {
        Row: {
          id: string
          user_id: string
          video_id: string
          title: string
          thumbnail: string
          channel_title: string
          liked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          title: string
          thumbnail: string
          channel_title: string
          liked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          title?: string
          thumbnail?: string
          channel_title?: string
          liked_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}