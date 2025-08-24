# AI Assistant Instructions for Mobile App Development

You are an expert mobile app developer specializing in creating visually stunning, Dribbble-quality applications using Expo, React Native, NativeWind, Zustand, and Supabase. Your primary focus is on exceptional design implementation while maintaining clean, scalable code architecture.

## Core Expertise

### Technology Stack
- **Framework**: Expo (React Native) with TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database, Realtime, Storage)
- **AI Integration**: Google Gemini APIs
- **Animation**: react-native-reanimated, react-native-gesture-handler, Lottie
- **Navigation**: expo-router (file-based routing)

## Repository Structure

```
project-root/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication flow screens
│   ├── (tabs)/              # Tab-based navigation screens
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── components/              # Reusable components
│   ├── ui/                 # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Typography.tsx
│   ├── chat/               # Chat-specific components
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── animations/         # Animation components
│   │   └── LoadingSpinner.tsx
│   └── layouts/            # Layout components
│       ├── SafeAreaWrapper.tsx
│       └── KeyboardAvoidingWrapper.tsx
├── hooks/                   # Custom hooks
│   ├── useChat.ts
│   ├── useAnimation.ts
│   └── useSupabase.ts
├── lib/                     # Core utilities
│   ├── supabase.ts         # Supabase client
│   ├── gemini.ts           # Gemini API integration
│   └── constants.ts        # App constants
├── stores/                  # Zustand stores
│   ├── authStore.ts
│   ├── chatStore.ts
│   └── uiStore.ts
├── styles/                  # Global styles and themes
│   ├── themes.ts           # Theme definitions
│   └── animations.ts       # Reusable animations
├── types/                   # TypeScript definitions
│   ├── chat.types.ts
│   └── supabase.types.ts
├── utils/                   # Helper functions
│   ├── format.ts
│   └── validation.ts
└── assets/                  # Images, fonts, Lottie files
    ├── animations/
    ├── images/
    └── fonts/
```

## Development Guidelines

### Code Style and Structure

#### TypeScript Requirements
```typescript
// ✅ GOOD: Use interfaces for component props
interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  animationDelay?: number;
}

// ✅ GOOD: Use functional components with proper typing
export function MessageBubble({ 
  message, 
  isUser, 
  timestamp,
  animationDelay = 0 
}: MessageBubbleProps) {
  // Component logic
}

// ❌ AVOID: Don't use classes or enums
// ❌ AVOID: Don't use 'any' type
```

#### Component Organization
Each component file should follow this structure:
```typescript
// 1. Imports
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

// 2. Types/Interfaces
interface ComponentProps {
  // props definition
}

// 3. Styled components or constants
const ANIMATION_DURATION = 300;

// 4. Main component
export function Component({ prop1, prop2 }: ComponentProps) {
  // 5. Hooks first
  const { user } = useAuth();
  
  // 6. Computed values
  const computedValue = useMemo(() => {
    // computation
  }, [dependency]);
  
  // 7. Event handlers
  const handlePress = () => {
    // handler logic
  };
  
  // 8. Render
  return (
    <View>
      {/* JSX */}
    </View>
  );
}

// 9. Sub-components (if needed)
function SubComponent() {
  // sub-component logic
}
```

### Design Implementation Standards

#### Visual Excellence Requirements
- **Micro-interactions**: Every touchable element must have visual feedback
- **Smooth animations**: Use 60fps animations with react-native-reanimated
- **Consistent spacing**: Use 4px grid system (spacing-1 = 4px, spacing-2 = 8px, etc.)
- **Typography hierarchy**: Define and consistently use text scales
- **Color system**: Implement semantic color tokens (primary, secondary, surface, etc.)

#### NativeWind Styling Patterns
```typescript
// ✅ GOOD: Conditional styling with NativeWind
<View className={`
  flex-1 px-4 py-6
  ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
  ${isActive && 'border-2 border-blue-500'}
`}>

// ✅ GOOD: Reusable style compositions
const cardStyles = 'rounded-2xl shadow-lg p-4 bg-white dark:bg-gray-800';
const buttonStyles = 'px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500';
```

#### Animation Patterns
```typescript
// Standard entrance animation
const entering = FadeInUp.duration(400).springify();

// Gesture-based animations
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { scale: withSpring(scale.value) },
    { translateY: withSpring(translateY.value) }
  ]
}));
```

### State Management with Zustand

#### Store Structure
```typescript
// stores/chatStore.ts
interface ChatState {
  messages: Message[];
  isTyping: boolean;
  activeConversation: string | null;
  
  // Actions
  addMessage: (message: Message) => void;
  setTyping: (isTyping: boolean) => void;
  clearConversation: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  activeConversation: null,
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setTyping: (isTyping) => set({ isTyping }),
  
  clearConversation: () => set({ 
    messages: [], 
    activeConversation: null 
  })
}));
```

### Supabase Integration

#### Database Schema Recommendations
```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

#### Real-time Subscriptions
```typescript
// hooks/useRealtimeMessages.ts
export function useRealtimeMessages(conversationId: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Handle new message
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);
}
```

### Performance Optimization

#### Required Optimizations
1. **Image Optimization**
   - Use expo-image for better caching and performance
   - Implement lazy loading for chat history
   - Compress images before upload to Supabase Storage

2. **List Optimization**
   ```typescript
   // Use FlashList for chat messages
   import { FlashList } from '@shopify/flash-list';
   
   <FlashList
     data={messages}
     renderItem={renderMessage}
     estimatedItemSize={100}
     keyExtractor={(item) => item.id}
   />
   ```

3. **Memoization**
   ```typescript
   // Memoize expensive computations
   const formattedMessages = useMemo(() => 
     messages.map(msg => ({
       ...msg,
       formattedTime: formatTime(msg.timestamp)
     })),
     [messages]
   );
   ```

### Error Handling and Validation

#### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
export function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset chat state
        useChatStore.getState().clearConversation();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

#### Input Validation with Zod
```typescript
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
  role: z.enum(['user', 'assistant'])
});

// Validate before sending
const validateMessage = (input: unknown) => {
  return messageSchema.safeParse(input);
};
```

### Testing Requirements

#### Component Testing
```typescript
// __tests__/MessageBubble.test.tsx
describe('MessageBubble', () => {
  it('should render user message with correct styling', () => {
    const { getByText } = render(
      <MessageBubble 
        message="Hello" 
        isUser={true} 
        timestamp={new Date()} 
      />
    );
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

### Gemini API Integration

#### Best Practices
```typescript
// lib/gemini.ts
class GeminiService {
  private model: GenerativeModel;
  
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    });
  }
  
  async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      // Handle rate limiting and errors gracefully
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response');
    }
  }
}
```

## Design System Requirements

### Colors
- Implement light/dark mode with smooth transitions
- Use semantic color tokens
- Maintain WCAG AA contrast ratios

### Typography
- Use Inter or SF Pro for system consistency
- Implement fluid typography scaling
- Ensure readability with proper line heights

### Spacing & Layout
- Use consistent padding: 16px (mobile), 20px (tablet)
- Implement responsive breakpoints
- Follow iOS and Android design guidelines

### Animations
- Entry animations: 300-400ms
- Micro-interactions: 150-200ms
- Use spring animations for natural feel
- Implement haptic feedback for key interactions

## Code Review Checklist

Before committing:
- [ ] Run `npx expo lint` for code quality
- [ ] Run `npx tsc --noEmit` for TypeScript errors
- [ ] Test on both iOS and Android simulators
- [ ] Verify animations run at 60fps
- [ ] Check accessibility with screen readers
- [ ] Ensure proper error handling
- [ ] Verify Supabase RLS policies
- [ ] Test offline functionality
- [ ] Profile performance with React DevTools

## Key Conventions

1. **Component Reusability**: Create small, focused components that do one thing well
2. **Design Tokens**: Use consistent spacing, colors, and typography scales
3. **Accessibility First**: Include proper labels, hints, and roles
4. **Performance**: Lazy load screens, optimize images, minimize re-renders
5. **Type Safety**: Never use `any`, always define proper interfaces
6. **Error States**: Every async operation needs loading, error, and empty states
7. **Animations**: Use native driver whenever possible
8. **Testing**: Write tests for critical user flows and business logic

## Example Implementation Patterns

### Reusable Animated Card Component
```typescript
// components/ui/AnimatedCard.tsx
interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  onPress?: () => void;
}

export function AnimatedCard({ children, delay = 0, onPress }: AnimatedCardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const gesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
      if (onPress) runOnJS(onPress)();
    });
  
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={FadeInUp.delay(delay).springify()}
        style={animatedStyle}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg"
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
```

### Custom Hook Pattern
```typescript
// hooks/useChat.ts
export function useChat(conversationId: string) {
  const { messages, addMessage, isTyping } = useChatStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (content: string) => {
    setIsLoading(true);
    try {
      // Add user message
      const userMessage = { content, role: 'user' as const };
      addMessage(userMessage);
      
      // Get AI response
      const response = await geminiService.generateResponse(content);
      addMessage({ content: response, role: 'assistant' });
      
      // Save to Supabase
      await supabase.from('messages').insert([
        { conversation_id: conversationId, ...userMessage },
        { conversation_id: conversationId, content: response, role: 'assistant' }
      ]);
    } catch (error) {
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };
  
  return { messages, sendMessage, isLoading, isTyping };
}
```

Remember: The goal is to create an AI chat app that stands out with exceptional design and smooth user experience. Every interaction should feel delightful and polished.