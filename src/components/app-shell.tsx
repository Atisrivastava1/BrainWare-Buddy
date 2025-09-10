'use client';

import type { User } from '@/app/page';
import { Header } from '@/components/header';
import { ChatInterface } from '@/components/chat-interface';

interface AppShellProps {
  user: User;
}

export function AppShell({ user }: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header user={user} />
      <main 
        className="flex-1 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.collegedunia.com/public/college_data/images/campusimage/14418835841.jpg')" }}
      >
        <div className="h-full w-full bg-black/50">
          <ChatInterface user={user} />
        </div>
      </main>
    </div>
  );
}
