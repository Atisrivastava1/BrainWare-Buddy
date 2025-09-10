'use client';

import { Bot, User, AlertTriangle, Volume2, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface Message {
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  onPlayAudio?: () => void;
  isSpeaking?: boolean;
  isPlayable?: boolean;
}

export function ChatMessage({ message, isLoading = false, onPlayAudio, isSpeaking = false, isPlayable = true }: ChatMessageProps) {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  const isBot = role === 'bot';
  const isSystem = role === 'system';

  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isLoading) {
    return (
      <div className="flex items-end gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback><Bot size={20} /></AvatarFallback>
        </Avatar>
        <div className="p-3 rounded-lg bg-card flex items-center space-x-1 animate-pulse">
          <span className="h-2 w-2 bg-muted-foreground/50 rounded-full inline-block animate-[bounce_1s_infinite] [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 bg-muted-foreground/50 rounded-full inline-block animate-[bounce_1s_infinite] [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 bg-muted-foreground/50 rounded-full inline-block animate-[bounce_1s_infinite]"></span>
        </div>
      </div>
    );
  }

  const Icon = isUser ? User : isSystem ? AlertTriangle : Bot;
  const avatarFallback = isUser ? "U" : "B";

  return (
    <div
      className={cn(
        'flex items-end gap-3 w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && !isSystem && (
         <Avatar className="w-8 h-8">
            <AvatarFallback>
                <Bot size={20} className="text-primary"/>
            </AvatarFallback>
        </Avatar>
      )}

      {isSystem ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-100 border border-yellow-200 text-yellow-800 p-3 rounded-lg max-w-xl mx-auto">
          <AlertTriangle className="w-5 h-5" />
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      ) : (
        <div className="flex items-end gap-2 max-w-xl">
            <div
            className={cn(
                'p-3 rounded-lg shadow-sm transition-transform transform-gpu animate-in fade-in-25 slide-in-from-bottom-2 duration-300 relative',
                isUser
                ? 'bg-user-message text-user-message-foreground rounded-br-none'
                : 'bg-card text-card-foreground rounded-bl-none'
            )}
            >
              <p className="whitespace-pre-wrap pb-4">{content}</p>
              <div className="absolute bottom-1 right-2 text-xs text-muted-foreground/70">
                {formattedTime}
              </div>
            </div>
            {isBot && onPlayAudio && (
            <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={onPlayAudio}
                aria-label={isSpeaking ? "Stop audio" : "Play audio"}
                disabled={!isPlayable}
            >
                {isSpeaking ? <Pause size={20} /> : <Volume2 size={20} />}
            </Button>
            )}
        </div>
      )}
      
      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-accent text-accent-foreground">{avatarFallback}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
