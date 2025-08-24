export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          title: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          message_count: number;
          last_message: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          message_count?: number;
          last_message?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          message_count?: number;
          last_message?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          content: string;
          role: "user" | "assistant";
          created_at: string;
          images: string[] | null;
          audio_url: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          content: string;
          role: "user" | "assistant";
          created_at?: string;
          images?: string[] | null;
          audio_url?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          content?: string;
          role?: "user" | "assistant";
          created_at?: string;
          images?: string[] | null;
          audio_url?: string | null;
        };
      };
    };
  };
};
