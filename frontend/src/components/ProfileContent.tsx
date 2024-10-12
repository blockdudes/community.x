import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { io, Socket } from 'socket.io-client'

interface FollowUserBody {
  userId: string;
  followUserId: string;
}

function ProfileContent() {
  const [user, setUser] = useState<any>();
  const [users, setUsers] = useState<any[]>();
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const account = "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6";
  const socketRef = useRef<Socket | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setSearchInput(value);
    // Simulate search results
    const allUsers = users || [];
    const results = value ? allUsers.filter(user => user?.name.toLowerCase().includes(value.toLowerCase())) : [];
    setSearchResults(results);
  };

  useEffect(() => {
    if (account) {
      fetchUser()
    }
  }, [])

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_API_URL as string);
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  })

  useEffect(() => {
    if (user) {
      fetchAllUsers()
    }
  }, [user])

  const fetchAllUsers = async () => {
    try {
      const allUserResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/all/users`);
      const allUsers = allUserResponse?.data?.users;
      const filteredUsers = allUsers.filter((u: any) =>
        u?._id !== user?._id &&
        !user?.followings.some((f: any) => f?._id === u?._id) &&
        !user?.followers.some((f: any) => f?._id === u?._id)
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchUser = async () => {
    try {
      const userResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/${account}`);
      console.log("aaya");
      setUser(userResponse?.data?.user);
    } catch (error) {
      console.log(error);
    }
  }

  const handleFollowUser = async (data: FollowUserBody) => {
    try {
      if (account && socketRef.current) {
        socketRef.current.emit("follow_user", data);
        socketRef.current.on("public_user", data => {
          console.log("CALLED")
          fetchUser();
          fetchAllUsers();
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleUnFollowUser = async (data: FollowUserBody) => {
    try {
      if (account && socketRef.current) {
        socketRef.current.emit("unfollow_user", data);
        socketRef.current.on("public_user", data => {
          console.log("CALLED")
          fetchUser();
          fetchAllUsers();
        })
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Your Profile" />
              <AvatarFallback>{user?.name?.split(' ').map((word: any) => word[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{user?.name}</h2>
              <p className="text-sm text-gray-500">{user?.username}</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-semibold">Following</h3>
            {user?.followings.map((followingUser: any, index: any) => {
              const data: FollowUserBody = {
                userId: user._id,
                followUserId: followingUser._id
              }
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${followingUser?.name?.split(' ').map((word: any) => word[0]).join('')}`} alt={followingUser?.name} />
                      <AvatarFallback>{followingUser?.name?.split(' ').map((word: any) => word[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">{followingUser?.name}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUnFollowUser(data)}>Unfollow</Button>
                </div>
              )
            })}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2">Add New Friend</h3>
            <div className="flex space-x-2 mb-4">
              <Input
                placeholder="Enter username"
                className="text-xs"
                value={searchInput}
                onChange={handleSearch}
              />
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {searchResults.map((followUser: any, index) => {
                  const data: FollowUserBody = {
                    userId: user?._id,
                    followUserId: followUser?._id
                  }
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${followUser?.name[0]}`} alt={followUser?.name} />
                          <AvatarFallback>{followUser?.name[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{followUser?.name}</p>
                      </div>
                      <Button className="bg-blue-500 text-white" size="sm" onClick={() => handleFollowUser(data)}>Follow</Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfileContent