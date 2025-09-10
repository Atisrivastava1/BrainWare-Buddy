'use client';

import { Bot } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface FeedbackCollectorProps {
  onSubmit: (feedback: string) => void;
}

export function FeedbackCollector({ onSubmit }: FeedbackCollectorProps) {
  const feedbackOptions = [
    { text: '⭐⭐⭐⭐⭐ Great!', value: 'Great' },
    { text: '⭐⭐ Needs work', value: 'Needs work' },
    { text: '💬 I have suggestions...', value: 'Suggestions' },
  ];

  return (
    <div className="flex items-end gap-3 w-full justify-start animate-in fade-in-25 slide-in-from-bottom-2 duration-300">
      <Avatar className="w-8 h-8">
        <AvatarFallback>
          <Bot size={20} className="text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="p-3 rounded-lg shadow-sm bg-card text-card-foreground rounded-bl-none max-w-xl space-y-3">
        <p className="whitespace-pre-wrap">How would you rate your experience so far?</p>
        <div className="flex flex-wrap gap-2">
          {feedbackOptions.map(option => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => onSubmit(option.value)}
              className="bg-background hover:bg-secondary"
            >
              {option.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
