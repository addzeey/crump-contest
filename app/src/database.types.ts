export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      art_contest: {
        Row: {
          channel: Database["public"]["Enums"]["channel"]
          created_at: string
          description: string | null
          display: boolean
          end_date: string | null
          galleryDisplay: boolean | null
          id: string
          max_votes: number
          nsfw: boolean
          start_date: string | null
          status: string
          title: string | null
          total_voted: number | null
          winners: Json | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["channel"]
          created_at?: string
          description?: string | null
          display?: boolean
          end_date?: string | null
          galleryDisplay?: boolean | null
          id?: string
          max_votes?: number
          nsfw?: boolean
          start_date?: string | null
          status?: string
          title?: string | null
          total_voted?: number | null
          winners?: Json | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["channel"]
          created_at?: string
          description?: string | null
          display?: boolean
          end_date?: string | null
          galleryDisplay?: boolean | null
          id?: string
          max_votes?: number
          nsfw?: boolean
          start_date?: string | null
          status?: string
          title?: string | null
          total_voted?: number | null
          winners?: Json | null
        }
        Relationships: []
      }
      auth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          refresh_token: string
          service_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          refresh_token: string
          service_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          refresh_token?: string
          service_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crumps: {
        Row: {
          accessory: string | null
          accessory2: string | null
          arms: string | null
          background: string | null
          body: string | null
          effect: string | null
          expression: string | null
          hair: string | null
          head: string | null
          id: number
          legs: string | null
          twitch_id: string | null
          user_id: string | null
        }
        Insert: {
          accessory?: string | null
          accessory2?: string | null
          arms?: string | null
          background?: string | null
          body?: string | null
          effect?: string | null
          expression?: string | null
          hair?: string | null
          head?: string | null
          id?: never
          legs?: string | null
          twitch_id?: string | null
          user_id?: string | null
        }
        Update: {
          accessory?: string | null
          accessory2?: string | null
          arms?: string | null
          background?: string | null
          body?: string | null
          effect?: string | null
          expression?: string | null
          hair?: string | null
          head?: string | null
          id?: never
          legs?: string | null
          twitch_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      entries: {
        Row: {
          canVote: boolean
          contest_id: string
          created_at: string
          discord_id: number
          discord_name: string
          id: string
          image_count: number
          isGif: boolean
          isVideo: string | null
          message: string | null
          type_index: number[] | null
        }
        Insert: {
          canVote?: boolean
          contest_id: string
          created_at?: string
          discord_id: number
          discord_name: string
          id?: string
          image_count?: number
          isGif?: boolean
          isVideo?: string | null
          message?: string | null
          type_index?: number[] | null
        }
        Update: {
          canVote?: boolean
          contest_id?: string
          created_at?: string
          discord_id?: number
          discord_name?: string
          id?: string
          image_count?: number
          isGif?: boolean
          isVideo?: string | null
          message?: string | null
          type_index?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "art_contest"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          house: Database["public"]["Enums"]["crump_house"] | null
          id: string
          points: number | null
          rank: string | null
          twitch_id: string | null
          user_id: string
          vote_count: number | null
        }
        Insert: {
          created_at?: string
          house?: Database["public"]["Enums"]["crump_house"] | null
          id?: string
          points?: number | null
          rank?: string | null
          twitch_id?: string | null
          user_id: string
          vote_count?: number | null
        }
        Update: {
          created_at?: string
          house?: Database["public"]["Enums"]["crump_house"] | null
          id?: string
          points?: number | null
          rank?: string | null
          twitch_id?: string | null
          user_id?: string
          vote_count?: number | null
        }
        Relationships: []
      }
      streamlink_tokens: {
        Row: {
          expires_at: string
          service_id: string
          token: string
        }
        Insert: {
          expires_at: string
          service_id: string
          token: string
        }
        Update: {
          expires_at?: string
          service_id?: string
          token?: string
        }
        Relationships: []
      }
      unique_games: {
        Row: {
          game_name: string | null
          id: number
        }
        Insert: {
          game_name?: string | null
          id?: never
        }
        Update: {
          game_name?: string | null
          id?: never
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          isAdmin: boolean
          isEditor: boolean | null
          isMod: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          isAdmin?: boolean
          isEditor?: boolean | null
          isMod?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          isAdmin?: boolean
          isEditor?: boolean | null
          isMod?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      vods: {
        Row: {
          auto_publish: boolean
          channel: string
          chapters: Json
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["vod_platform"]
          status: Database["public"]["Enums"]["vod_status"]
          streamed_at: string
          title: string
        }
        Insert: {
          auto_publish?: boolean
          channel?: string
          chapters: Json
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["vod_platform"]
          status?: Database["public"]["Enums"]["vod_status"]
          streamed_at: string
          title: string
        }
        Update: {
          auto_publish?: boolean
          channel?: string
          chapters?: Json
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["vod_platform"]
          status?: Database["public"]["Enums"]["vod_status"]
          streamed_at?: string
          title?: string
        }
        Relationships: []
      }
      vote_entries: {
        Row: {
          contest_id: string
          created_at: string
          id: number
          user: string
          votes: string[] | null
        }
        Insert: {
          contest_id: string
          created_at?: string
          id?: number
          user?: string
          votes?: string[] | null
        }
        Update: {
          contest_id?: string
          created_at?: string
          id?: number
          user?: string
          votes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "vote_entries_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "art_contest"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_votes: {
        Args: { p_contest_id: string }
        Returns: undefined
      }
      get_provider_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      populate_unique_games: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_profile_vote_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      channel: "murdercrumpet" | "crazymangovr"
      chapters: "StartOffset" | "Game"
      crump_house: "coom" | "nub" | "gub" | "xdd"
      vod_platform: "twitch" | "kick"
      vod_status: "recording" | "encoding" | "uploading" | "complete" | "error"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      channel: ["murdercrumpet", "crazymangovr"],
      chapters: ["StartOffset", "Game"],
      crump_house: ["coom", "nub", "gub", "xdd"],
      vod_platform: ["twitch", "kick"],
      vod_status: ["recording", "encoding", "uploading", "complete", "error"],
    },
  },
} as const
