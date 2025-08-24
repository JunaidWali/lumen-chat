-- Lumen Chat Database Schema
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_message TEXT
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images TEXT[],
  audio_url TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at in conversations
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete own conversations" ON conversations
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages from their conversations
CREATE POLICY "Users can view messages from own conversations" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Users can insert messages to their conversations
CREATE POLICY "Users can insert messages to own conversations" ON messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Users can update messages in their conversations
CREATE POLICY "Users can update messages in own conversations" ON messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Users can delete messages from their conversations
CREATE POLICY "Users can delete messages from own conversations" ON messages
    FOR DELETE USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()::text
        )
    );
