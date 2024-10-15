import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { Home, Lock, UserPlus, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useRouter, usePathname } from 'next/navigation';
import { WalletSelector as ShadcnWalletSelector } from "./WalletSelector";
import { useAppSelector } from '@/lib/hooks';
import { useParams } from 'next/navigation';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import axios from 'axios';

interface OpenSpaces {
  [key: number]: boolean;
}

interface User {
  name: string;
  username: string;
  avatar: string;
}

export function MobileSidebar() {
  return (
    <div className="py-2">
      <SidebarContent />
    </div>
  );
}

export function DesktopSidebar() {
  return <SidebarContent />;
}



export function SidebarContent() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isPrivateSpacesOpen, setIsPrivateSpacesOpen] = useState(false);
  const router = useRouter();
  const { account } = useWallet();

  useEffect(() => {
    if (account?.address) {
      fetchUser();
    }
  }, [account?.address]);

  const fetchUser = async () => {
    try {
      const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/${account?.address}`);
      setUser(userResponse?.data?.user);
    } catch (error) {
      console.log(error);
    }
  }

  const getSelectedSpaceAndChannel = () => {
    const pathSegments = pathname.split('/');
    const isPrivate = pathSegments[1] === 'private';
    if (isPrivate && pathSegments.length >= 4) {
      const selectedSpaceId = parseInt(pathSegments[2], 10);
      const selectedChannel = pathSegments[3];
      return { selectedSpaceId, selectedChannel };
    }
    return { selectedSpaceId: null, selectedChannel: null };
  };

  const { selectedSpaceId, selectedChannel } = getSelectedSpaceAndChannel();

  const [openSpaces, setOpenSpaces] = useState<OpenSpaces>(
    {
      [selectedSpaceId || 0]: true,
    }
  );

  const privateSpaces = useAppSelector(state => state.fetchPrivateSpace.privateSpace);
  const filteredPrivateSpaces = privateSpaces?.filter((space) => {
    if (Array.isArray(space.members)) {
      return space.members.some((member: any) =>
        member.address === account?.address
      );
    }
    return false;
  });
 

  const toggleSpace = (spaceId: number) => {
    setOpenSpaces((prev) => ({ ...prev, [spaceId]: !prev[spaceId] }));
  };

  useEffect(() => {
    if (selectedSpaceId) {
      setIsPrivateSpacesOpen(true);
      setOpenSpaces((prev) => ({ ...prev, [selectedSpaceId]: true }));
      console.log(`Selected Space ID: ${selectedSpaceId}`);
    }
  }, [selectedSpaceId]);

  return (
    <div className="flex flex-col h-full p-2 w-64">
      <div className="flex items-center my-4">
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt="Profile" />
          <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-sm">{((user?.name) as string)?.charAt(0).toUpperCase() + ((user?.name) as string)?.slice(1) || "..."}</h2>
          <p className="text-xs text-gray-500">@{user?.username || "..."}</p>
        </div>
      </div>
      <nav className="space-y-2 hover:none">
        {/* Home Button */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start text-xs ${pathname === '/home' ? 'bg-black text-white bg-opacity-80' : ''}`}
          onClick={() => router.push('/home')}
        >
          <Home className="mr-2 h-3 w-3" /> Home
        </Button>

        {/* Private Spaces */}
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
            {filteredPrivateSpaces && filteredPrivateSpaces?.map((space: any) => (
              <Collapsible
                key={space._id}
                open={openSpaces[space._id]}
                onOpenChange={() => toggleSpace(space._id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between text-xs pl-6"
                  >
                    <span>{space.name}</span>
                    {openSpaces[space._id] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button >
                </CollapsibleTrigger >
                <CollapsibleContent className="space-y-1 mt-1">
                  {['general', 'announcement', 'governance'].map((channel) => (
                    <Button
                      key={channel}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-xs pl-10 ${selectedSpaceId === space._id && selectedChannel === channel ? 'bg-black text-white bg-opacity-80' : ''}`}
                      onClick={() => router.push(`/private/${space._id}/${channel}`)}
                    >
                      # {channel}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible >
            ))
            }
          </CollapsibleContent >
        </Collapsible >

        {/* Join Space */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start text-xs ${pathname === '/joinSpace' ? 'bg-black text-white' : ''}`}
          onClick={() => router.push('/joinSpace')}
        >
          <UserPlus className="mr-2 h-3 w-3" /> Join Space
        </Button>

        {/* Profile */}
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start text-xs ${pathname === '/profile' ? 'bg-black text-white' : ''}`}
          onClick={() => router.push('/profile')}
        >
          <User className="mr-2 h-3 w-3" /> Profile
        </Button>

        <ShadcnWalletSelector />
      </nav >
    </div >
  );
}
