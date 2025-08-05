// Supabase自動生成された型定義（実際の実装時にsupabase gen typesで生成）
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          fruits: any // JSONB
          avatar_config: any // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          fruits: any
          avatar_config?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          fruits?: any
          avatar_config?: any
          created_at?: string
          updated_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          user_id: string
          name: string
          current_year: number
          current_month: number
          current_day: number
          game_speed: string
          reputation: number
          funds: number
          facilities: any // JSONB
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          current_year?: number
          current_month?: number
          current_day?: number
          game_speed?: string
          reputation?: number
          funds?: number
          facilities?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          current_year?: number
          current_month?: number
          current_day?: number
          game_speed?: string
          reputation?: number
          funds?: number
          facilities?: any
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          school_id: string
          pokemon_id: number
          pokemon_name: string
          pokemon_type_1: string
          pokemon_type_2: string | null
          custom_name: string | null
          grade: number
          position: string
          join_date: string
          graduation_date: string | null
          level: number
          experience: number
          evolution_stage: number
          power: number
          technique: number
          speed: number
          stamina: number
          mental: number
          serve_skill: number
          volley_skill: number
          stroke_skill: number
          return_skill: number
          singles_aptitude: number
          doubles_aptitude: number
          tactical_understanding: number
          iv_power: number
          iv_technique: number
          iv_speed: number
          iv_stamina: number
          iv_mental: number
          ev_power: number
          ev_technique: number
          ev_speed: number
          ev_stamina: number
          ev_mental: number
          nature: any // JSONB
          ability: any // JSONB
          hidden_ability: any | null // JSONB
          condition: string
          physical_fatigue: number
          mental_fatigue: number
          accumulated_fatigue: number
          motivation: number
          learned_moves: any // JSONB
          move_slots: number
          matches_played: number
          matches_won: number
          sets_won: number
          sets_lost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          pokemon_id: number
          pokemon_name: string
          pokemon_type_1: string
          pokemon_type_2?: string | null
          custom_name?: string | null
          grade: number
          position?: string
          join_date?: string
          graduation_date?: string | null
          level?: number
          experience?: number
          evolution_stage?: number
          power?: number
          technique?: number
          speed?: number
          stamina?: number
          mental?: number
          serve_skill?: number
          volley_skill?: number
          stroke_skill?: number
          return_skill?: number
          singles_aptitude?: number
          doubles_aptitude?: number
          tactical_understanding?: number
          iv_power?: number
          iv_technique?: number
          iv_speed?: number
          iv_stamina?: number
          iv_mental?: number
          ev_power?: number
          ev_technique?: number
          ev_speed?: number
          ev_stamina?: number
          ev_mental?: number
          nature?: any
          ability?: any
          hidden_ability?: any | null
          condition?: string
          physical_fatigue?: number
          mental_fatigue?: number
          accumulated_fatigue?: number
          motivation?: number
          learned_moves?: any
          move_slots?: number
          matches_played?: number
          matches_won?: number
          sets_won?: number
          sets_lost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          pokemon_id?: number
          pokemon_name?: string
          pokemon_type_1?: string
          pokemon_type_2?: string | null
          custom_name?: string | null
          grade?: number
          position?: string
          join_date?: string
          graduation_date?: string | null
          level?: number
          experience?: number
          evolution_stage?: number
          power?: number
          technique?: number
          speed?: number
          stamina?: number
          mental?: number
          serve_skill?: number
          volley_skill?: number
          stroke_skill?: number
          return_skill?: number
          singles_aptitude?: number
          doubles_aptitude?: number
          tactical_understanding?: number
          iv_power?: number
          iv_technique?: number
          iv_speed?: number
          iv_stamina?: number
          iv_mental?: number
          ev_power?: number
          ev_technique?: number
          ev_speed?: number
          ev_stamina?: number
          ev_mental?: number
          nature?: any
          ability?: any
          hidden_ability?: any | null
          condition?: string
          physical_fatigue?: number
          mental_fatigue?: number
          accumulated_fatigue?: number
          motivation?: number
          learned_moves?: any
          move_slots?: number
          matches_played?: number
          matches_won?: number
          sets_won?: number
          sets_lost?: number
          created_at?: string
          updated_at?: string
        }
      }
      // 他のテーブルも必要に応じて追加
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