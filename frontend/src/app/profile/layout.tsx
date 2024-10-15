'use client'

import RightSidebar from '@/components/RightSidebar';
import { SidebarContent } from '@/components/Sidebar';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {

  const { connected } = useWallet();
  const router = useRouter();
  
  if(!connected) {
    router.push('/');
  }

  return (
    <div className="flex h-screen">
      <SidebarContent />

      <div className="flex-1 p-4 bg-gray-100 overflow-auto">
        {children}
      </div>

      <RightSidebar />
    </div>
  );
}
