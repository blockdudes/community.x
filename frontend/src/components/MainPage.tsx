"use client"

import React, { useState } from 'react'
import { Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar, DesktopSidebar, SidebarContent } from './Sidebar'
import FeedContent from './FeedContent'
import JoinSpaceContent from './JoinSpaceContent'
import ProfileContent from './ProfileContent'
import RightSidebar from './RightSidebar'
import PrivateSpaceContent from './PrivateSpaceContent'

export default function MainPage() {
  const [selectedTab, setSelectedTab] = useState<string>('home');
  const [selectedSpace, setSelectedSpace] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('general');

  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-none border-none">
      <div className="flex flex-col lg:flex-row">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex justify-between items-center p-2 border-b">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Users className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <MobileSidebar setSelectedTab={setSelectedTab} setSelectedSpace={setSelectedSpace} setSelectedChannel={setSelectedChannel} selectedSpace={selectedSpace} selectedChannel={selectedChannel} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-bold">Social Media</h1>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
            <AvatarFallback>BN</AvatarFallback>
          </Avatar>
        </div>

        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block w-1/5 bg-white p-4 border-r border-gray-200 ">
          <DesktopSidebar setSelectedTab={setSelectedTab} setSelectedSpace={setSelectedSpace} setSelectedChannel={setSelectedChannel} selectedSpace={selectedSpace} selectedChannel={selectedChannel} />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/5 bg-gray-100 p-2 lg:p-4">
          <ScrollArea className="h-[calc(100vh-2rem)]">
            {selectedTab === 'home' && <FeedContent selectedSpace={selectedSpace} />}
            {selectedTab === 'private-space' && <PrivateSpaceContent selectedSpace={selectedSpace} selectedChannel={selectedChannel} />}
            {selectedTab === 'join-space' && <JoinSpaceContent />}
            {selectedTab === 'profile' && <ProfileContent />}
          </ScrollArea>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-1/5 bg-white p-4 border-l border-gray-200">
          <ScrollArea className="h-[calc(100vh-2rem)]">
            <RightSidebar />
          </ScrollArea>
        </div>
      </div>
    </Card>
  )
}