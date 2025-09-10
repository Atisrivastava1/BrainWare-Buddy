
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Send, Mic, Loader2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message } from '@/components/chat-message';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { answerQueryFromContext } from '@/ai/flows/answer-student-queries';
import { createTimetable } from '@/ai/flows/create-timetable';
import { shouldRouteToHelpdesk } from '@/ai/flows/smart-fallback-to-helpdesk';
import { tellRiddle } from '@/ai/flows/tell-riddle-flow';
import { getKnowledgeBase } from '@/lib/firebase';
import type { User } from '@/app/page';
import { FeedbackCollector } from './feedback-collector';

interface ChatInterfaceProps {
  user: User;
}

const FALLBACK_ANSWER = "I'm still learning about that. Could you ask in a different way? Or I can connect you to a human representative.";

export function ChatInterface({ user }: ChatInterfaceProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [knowledgeBaseContent, setKnowledgeBaseContent] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isTimetableMode, setIsTimetableMode] = useState(false);
  const [isRiddleMode, setIsRiddleMode] = useState(false);
  const [isSuggestionMode, setIsSuggestionMode] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const userName = user.email.split('@')[0];

  useEffect(() => {
    async function loadKnowledgeBase() {
      setIsLoading(true);
      try {
        const kb = await getKnowledgeBase();
        setKnowledgeBaseContent(JSON.stringify(kb, null, 2));
        const welcomeMessage = t('welcomeMessage').replace('Hello!', `Hello, ${userName}!`);
        setMessages([{ role: 'bot', content: welcomeMessage, timestamp: new Date().toISOString() }]);
      } catch (error) {
        console.error("Failed to load knowledge base from Firestore:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load knowledge base. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadKnowledgeBase();
  }, [toast, t, userName]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollableViewport) {
        scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
      }
    }
  }, [messages, showFeedback]);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let description = t('voiceErrorDescription');
        if (event.error === 'not-allowed') {
          description = 'Microphone permission denied. Please allow microphone access in your browser settings.';
        }
        toast({
          variant: 'destructive',
          title: t('voiceErrorTitle'),
          description: description,
        });
      };
    }
  }, [t, toast]);
  
  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const handlePlayAudio = useCallback((text: string) => {
    if (!window.speechSynthesis || isMuted) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      if (event.error === 'interrupted') {
        // This error is often not critical, so we just stop speaking.
        setIsSpeaking(false);
        return;
      }
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Could not play audio for this message.',
      });
    };
    window.speechSynthesis.speak(utterance);
  }, [isMuted, toast]);

  useEffect(() => {
    return () => {
      // Cleanup speech synthesis on component unmount
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    const userMessage: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    let newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const chatHistoryForFlow = newMessages
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      let botMessageContent: string | null = null;

      if (isSuggestionMode) {
        botMessageContent = "Thank you for the suggestion! I will surely ask my creators to improve it.";
        setIsSuggestionMode(false);
        setFeedbackGiven(true);
      } else if (isTimetableMode) {
        const { response, isDone } = await createTimetable({
          chatHistory: chatHistoryForFlow,
        });
        botMessageContent = response;
        if (isDone) {
          setIsTimetableMode(false);
        }
      } else if (isRiddleMode) {
        const { response, isDone } = await tellRiddle({
          chatHistory: chatHistoryForFlow,
        });
        botMessageContent = response;
        if (isDone) {
          setIsRiddleMode(false);
        }
      } else {
        const { answer, isTimetableRequest, isRiddleRequest } = await answerQueryFromContext({ 
          query: currentInput, 
          context: knowledgeBaseContent,
          chatHistory: chatHistoryForFlow,
          userName: userName,
        });
        
        botMessageContent = answer;

        if (isTimetableRequest) {
          setIsTimetableMode(true);
          const tempBotMessage: Message = { role: 'bot', content: botMessageContent, timestamp: new Date().toISOString() };
          const { response } = await createTimetable({
            chatHistory: [...newMessages, tempBotMessage]
              .map(m => `${m.role}: ${m.content}`)
              .join('\n'),
          });
          botMessageContent = response;
        } else if (isRiddleRequest) {
          setIsRiddleMode(true);
          const tempBotMessage: Message = { role: 'bot', content: botMessageContent, timestamp: new Date().toISOString() };
          const { response } = await tellRiddle({
            chatHistory: [...newMessages, tempBotMessage]
              .map(m => `${m.role}: ${m.content}`)
              .join('\n'),
          });
          botMessageContent = response;
        }
      }
      
      if (botMessageContent) {
        const botMessage: Message = { role: 'bot', content: botMessageContent, timestamp: new Date().toISOString() };
        newMessages = [...newMessages, botMessage];
        setMessages(newMessages);
      
        if (!isMuted) {
          handlePlayAudio(botMessage.content);
        }

        const userMessageCount = newMessages.filter(m => m.role === 'user').length;
        if (userMessageCount >= 2 && !feedbackGiven) {
          setShowFeedback(true);
        }
        
        // Only escalate if the bot gives a fallback answer.
        if (botMessageContent === FALLBACK_ANSWER) {
          try {
            const chatHistoryForHelpdesk = newMessages
              .map(m => `${m.role}: ${m.content}`)
              .join('\n');
            
            const { shouldRoute, reason } = await shouldRouteToHelpdesk({
              query: currentInput,
              chatHistory: chatHistoryForHelpdesk,
            });

            if (shouldRoute) {
              const systemMessage: Message = {
                role: 'system',
                content: `${t('escalationReason')}: ${reason}\n${t('escalationPrompt')}`,
                timestamp: new Date().toISOString(),
              };
              setMessages(prev => [...prev, systemMessage]);
            }
          } catch (error) {
             console.error('Error in helpdesk routing:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = { 
        role: 'bot', 
        content: "I will ask my creators to feed me with this information, as I am unable to find an answer at the moment.", 
        timestamp: new Date().toISOString() 
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTimetableMode(false); // Reset mode on error
      setIsSuggestionMode(false); // Reset suggestion mode on error
      setIsRiddleMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (!isMuted && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFeedbackSubmit = (feedback: string) => {
    setShowFeedback(false);

    if (feedback === 'Suggestions') {
      setIsSuggestionMode(true);
      const suggestionPrompt: Message = {
        role: 'bot',
        content: "I'd love to hear your suggestions. Please type them below.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, suggestionPrompt]);
    } else {
      setFeedbackGiven(true);
      const feedbackMessage: Message = {
        role: 'system',
        content: `Thank you for your feedback: ${feedback}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, feedbackMessage]);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4 max-w-4xl mx-auto w-full">
      <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              onPlayAudio={message.role === 'bot' ? () => handlePlayAudio(message.content) : undefined}
              isSpeaking={isSpeaking}
              isPlayable={!isMuted}
            />
          ))}
          {isLoading && <ChatMessage message={{ role: 'bot', content: '', timestamp: new Date().toISOString() }} isLoading={true} />}
          {showFeedback && <FeedbackCollector onSubmit={handleFeedbackSubmit} />}
        </div>
      </ScrollArea>
      <div className="pt-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isSuggestionMode ? 'Type your suggestions here...' : t('inputPlaceholder')}
            className="pr-32 py-3 text-base"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading || !knowledgeBaseContent}
            autoFocus={isSuggestionMode}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
             {recognitionRef.current && (
                <Button type="button" size="icon" variant="ghost" onClick={handleVoiceInput} disabled={isLoading} aria-label={isListening ? 'Stop listening' : 'Start listening'}>
                  <Mic className={`transition-colors ${isListening ? 'text-destructive' : 'text-muted-foreground'}`} />
                </Button>
              )}
              <Button type="button" size="icon" variant="ghost" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <VolumeX className="text-muted-foreground" /> : <Volume2 className="text-muted-foreground" />}
              </Button>
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !knowledgeBaseContent} aria-label="Send message">
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

    