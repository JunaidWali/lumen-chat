# Welcome to your Expo app 👋

# Lumen Chat - AI Chat Application

A modern, feature-rich AI chat application built with React Native, Expo, and Google Gemini AI. Chat with multiple AI models, manage conversation history, and enjoy advanced features like image support, voice input, and web search.

## ✨ Features

- **Multiple AI Models**: Choose from various Gemini models (Pro, Pro Vision, 1.5 Pro, 1.5 Flash)
- **Multi-Modal Chat**: Support for text, images, and voice input
- **Conversation Management**: Persistent chat history with automatic title generation
- **Web Search**: Enable AI to search the web for current information (on supported models)
- **Voice-to-Text**: Record audio messages and convert them to text
- **Image Support**: Send images to vision-capable models
- **Real-time Chat**: Smooth, responsive chat interface
- **Settings**: Customizable temperature, model selection, and preferences
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Database**: Supabase
- **AI Integration**: Google Gemini AI
- **Navigation**: Expo Router
- **Audio**: Expo AV
- **Images**: Expo Image Picker & Manipulator

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Google AI API key
- Supabase account (optional, for persistence)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/JunaidWali/lumen-chat.git
   cd lumen-chat
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:

   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url-here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

4. **Get Google AI API Key**

   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Set up Supabase (Optional)**

   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL commands in `database/schema.sql` to set up tables
   - Add your Supabase URL and anon key to `.env`

6. **Start the development server**
   ```bash
   npm start
   ```

## 📱 Usage

### Basic Chat

1. Open the app and navigate to the Chat tab
2. Select your preferred AI model using the model selector
3. Type your message and press send
4. The AI will respond based on the selected model's capabilities

### Image Chat

1. Tap the image icon in the chat input
2. Choose to take a photo or select from gallery
3. Add multiple images if needed
4. Send your message with images to vision-capable models

### Voice Input

1. Tap and hold the microphone icon to start recording
2. Speak your message
3. Release to stop recording
4. The audio will be transcribed to text automatically

### Conversation Management

1. Switch to the Conversations tab to see all your chats
2. Tap any conversation to continue chatting
3. Long press to delete conversations
4. Tap the + button to start a new chat

### Settings

1. Tap the model selector in the chat screen
2. Adjust temperature (creativity vs accuracy)
3. Enable/disable web search for supported models
4. Choose different AI models based on your needs

## 🔧 Configuration

### Model Settings

- **Temperature**: Controls randomness (0.1 = focused, 1.0 = creative)
- **Web Search**: Allows AI to search for current information
- **Model Selection**: Choose based on your needs:
  - **Gemini Pro**: Best for text-only conversations
  - **Gemini Pro Vision**: Supports images
  - **Gemini 1.5 Pro**: Latest with web search and images
  - **Gemini 1.5 Flash**: Faster responses with all features

### Database Schema

If using Supabase, create these tables:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  message_count INTEGER DEFAULT 0,
  last_message TEXT
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  images TEXT[],
  audio_url TEXT
);
```

## 🎯 Features Roadmap

- [ ] User authentication and profiles
- [ ] Message search and filtering
- [ ] Export conversations
- [ ] Custom AI model integration
- [ ] Group conversations
- [ ] Message reactions and favorites
- [ ] Dark mode theme
- [ ] Push notifications
- [ ] Offline mode with sync

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google AI for the Gemini API
- Expo team for the amazing development platform
- Supabase for the backend infrastructure
- The React Native community for excellent libraries

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact me at your-email@example.com.
