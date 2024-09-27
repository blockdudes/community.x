import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react'
import { Bell, MessageCircle, Users, Image as ImageIcon, LogOutIcon, Settings, FileText, MapPin, Globe, Send, MoreVertical, Heart, Music, Utensils, Home, Lock, UserPlus, User, Search, ChevronDown, ChevronUp, Plus, X, TrendingUp } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { WalletSelector as ShadcnWalletSelector } from "./WalletSelector";

interface OpenSpaces {
    [key: number]: boolean;
  }

export function MobileSidebar({ setSelectedTab, setSelectedSpace, setSelectedChannel, selectedSpace, selectedChannel }: { setSelectedTab: (tab: string) => void, setSelectedSpace: (space: any) => void, setSelectedChannel: (channel: string) => void, selectedSpace: any, selectedChannel: string }) {
    return (
      <div className="py-2">
        <SidebarContent setSelectedTab={setSelectedTab} setSelectedSpace={setSelectedSpace} setSelectedChannel={setSelectedChannel} selectedSpace={selectedSpace} selectedChannel={selectedChannel} />
      </div>
    )
  }
  
  export function DesktopSidebar({ setSelectedTab, setSelectedSpace, setSelectedChannel, selectedSpace, selectedChannel }: { setSelectedTab: (tab: string) => void, setSelectedSpace: (space: any) => void, setSelectedChannel: (channel: string) => void, selectedSpace: any, selectedChannel: string }) {
    return <SidebarContent setSelectedTab={setSelectedTab} setSelectedSpace={setSelectedSpace} setSelectedChannel={setSelectedChannel} selectedSpace={selectedSpace} selectedChannel={selectedChannel} />
  }
  
  export function SidebarContent({ setSelectedTab, setSelectedSpace, setSelectedChannel, selectedSpace, selectedChannel }: { setSelectedTab: (tab: string) => void, setSelectedSpace: (space: any) => void, setSelectedChannel: (channel: string) => void, selectedSpace: any, selectedChannel: string }) {
    const [isPrivateSpacesOpen, setIsPrivateSpacesOpen] = useState(false)
    const [openSpaces, setOpenSpaces] = useState<OpenSpaces>({})
    const [activeTab, setActiveTab] = useState('home') // Add state to track active tab
  
    const privateSpaces = [
      { id: 1, name: "Crypto Punks", description: "Discuss and trade CryptoPunks NFTs" },
      { id: 2, name: "Bored Ape Yacht Club", description: "BAYC enthusiasts and collectors" },
      { id: 3, name: "Art Blocks", description: "Generative art NFT community" },
    ]
  
    const toggleSpace = (spaceId: number) => {
      setOpenSpaces(prev => ({ ...prev, [spaceId]: !prev[spaceId] }))
    }
  
    const selectChannel = (space: any, channel: string) => {
      setSelectedTab('private-space')
      setSelectedSpace(space)
      setSelectedChannel(channel)
      setActiveTab('private-space') // Update active tab
    }
  
    return (
      <>
        <div className="flex items-center my-4">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Profile" />
            <AvatarFallback>BN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">Bogdan Nikitin</h2>
            <p className="text-xs text-gray-500">@nikitinteam</p>
          </div>
        </div>
        <nav className="space-y-2 hover:none">
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-xs ${activeTab === 'home' ? 'bg-black text-white bg-opacity-80' : ''}`}
            onClick={() => {
              setSelectedTab('home')
              setActiveTab('home') // Update active tab
            }}
          >
            <Home className="mr-2 h-3 w-3" /> Home
          </Button>
          <Collapsible open={isPrivateSpacesOpen} onOpenChange={setIsPrivateSpacesOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between text-xs"
              >
                <span className="flex items-center">
                  <Lock className="mr-2 h-3 w-3" /> Private Spaces
                </span>
                {isPrivateSpacesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-1">
              {privateSpaces.map((space) => (
                <Collapsible key={space.id} open={openSpaces[space.id]} onOpenChange={() => toggleSpace(space.id)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs pl-6"
                    >
                      <span>{space.name}</span>
                      {openSpaces[space.id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {['general', 'announcement', 'governance'].map((channel) => (
                      <Button
                        key={channel}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start text-xs pl-10 ${activeTab === 'private-space' && selectedSpace?.id === space.id && selectedChannel === channel ? 'bg-black text-white bg-opacity-80 ' : ''}`}
                        onClick={() => selectChannel(space, channel)}
                      >
                        #{channel}
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CollapsibleContent>
          </Collapsible>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-xs ${activeTab === 'join-space' ? 'bg-black text-white' : ''}`}
            onClick={() => {
              setSelectedTab('join-space')
              setActiveTab('join-space') // Update active tab
            }}
          >
            <UserPlus className="mr-2 h-3 w-3" /> Join Space
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`w-full justify-start text-xs ${activeTab === 'profile' ? 'bg-black text-white' : ''}`}
            onClick={() => {
              setSelectedTab('profile')
              setActiveTab('profile') // Update active tab
            }}
          >
            <User className="mr-2 h-3 w-3" /> Profile
          </Button>
          <ShadcnWalletSelector />
        </nav>
      </>
    )
  }
  

