export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      art_contest: {
        Row: {
          created_at: string
          description: string | null
          display: boolean
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          title: string | null
          total_voted: number | null
          winners: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display?: boolean
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string | null
          total_voted?: number | null
          winners?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display?: boolean
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          title?: string | null
          total_voted?: number | null
          winners?: Json | null
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
          isVideo: string | null
          message: string | null
        }
        Insert: {
          canVote?: boolean
          contest_id: string
          created_at?: string
          discord_id: number
          discord_name: string
          id?: string
          image_count?: number
          isVideo?: string | null
          message?: string | null
        }
        Update: {
          canVote?: boolean
          contest_id?: string
          created_at?: string
          discord_id?: number
          discord_name?: string
          id?: string
          image_count?: number
          isVideo?: string | null
          message?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: number
          isAdmin: boolean
          isMod: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          isAdmin?: boolean
          isMod?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          isAdmin?: boolean
          isMod?: boolean
          user_id?: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
