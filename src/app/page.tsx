'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';

const LoginPage = dynamic(() => import('@/components/login-page').then(mod => mod.LoginPage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <div className="space-y-6 pt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  ),
});

export type User = {
  email: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <AppShell user={user} />;
}
