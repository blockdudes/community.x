"use client"
import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchPrivateSpace } from "@/lib/features/FetchPrivateSpaceSlice";
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import io, { Socket } from "socket.io-client";
import { privateSpaceType } from '@/types/privateTypes';
import axios from 'axios';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Users, Plus, TrendingUp } from 'lucide-react'

function RightSidebar() {
  // const address = (useWallet()).account?.address;
  const account = "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6";

  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;
  const users = useAppSelector(state => state.fetchAllUser.users);
  const userProfile = users.find(user => user.address === account);

  const unfollowedUsers = (users.filter((item: any) =>
    item.address !== account &&
    !item.followers.some((follower: any) => follower.address === account)
  )).slice(-5);


  const filteredPrivateSpaces = (privateSpaces?.filter((space) => {
    if (Array.isArray(space.members)) {
      return space.members.every((member: any) =>
        member.address !== account
      );
    }
    return false;
  }))?.slice(-5);

  useEffect(() => {
    dispatch(fetchPrivateSpace())
    dispatch(fetchAllUsers())
  }, []);

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
  }, [])

  useEffect(() => {
    if (account && socketRef.current) {
      socketRef.current.on("public_user", (data: any) => {
        console.log("public users: ", data)
        dispatch(fetchAllUsers());
      });
      dispatch(fetchAllUsers());
    }
  }, [account])

  const handleFollow = async (data: any) => {
    try {
      if (account && socketRef.current) {
        socketRef.current.emit("follow_user", data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const joinPrivateSpace = async (space: privateSpaceType) => {
    try {
      const entrybalance = 1000; /// contract call for fetching token balance
      if (entrybalance >= space.entryCondition.maxAmount && userProfile) {
        const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/private/space/join/member`, {
          privateSpaceId: (space as any)._id,
          userId: (userProfile as any)._id
        });
        if (resp.status === 200) {
          dispatch(fetchPrivateSpace());
        }
      } else {
        console.log("you can't join this private space");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-10 text-gray-600 p-4">
      <section>
        <h2 className="text-sm font-bold mb-3 flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          New Spaces
        </h2>
        <div className="space-y-3">
          {filteredPrivateSpaces?.map((space: privateSpaceType, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${space?.name[0]}`} alt={space?.name} />
                  <AvatarFallback>{space.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-semibold text-gray-600">{space.name}</p>
                  <p className="text-[10px] text-gray-400">{(space.members as any)?.length} members</p>
                </div>
              </div>
              <Button onClick={() => joinPrivateSpace(space)} size="sm" variant="outline" className="text-[10px] h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                <Plus className="w-3 h-3 mr-1" />
                Join
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3 text-gray-600">Suggestions</h2>
        <div className="space-y-3">
          {unfollowedUsers.map((user, index) => {
            const data = {
              userId: (userProfile as any)._id,
              followUserId: user._id
            }
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${user?.name[0]}`} alt={user?.name} />
                    <AvatarFallback>{user?.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">{user?.name}</p>
                    <p className="text-[10px] text-gray-400">@{user?.username.toLowerCase().replace(' ', '')}</p>
                  </div>
                </div>
                <Button onClick={() => handleFollow(data)} size="sm" variant="outline" className="text-[10px] h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">Follow</Button>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold mb-3 flex items-center text-gray-800">
          <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
          Trending Topics
        </h2>
        <div className="space-y-2">
          {['#TechNews', '#BookRecommendations', '#FitnessChallenge', '#CodingTips', '#HealthyRecipes'].map((topic, index) => (
            <div key={index} className="text-xs">
              <p className="font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors">{topic}</p>
              <p className="text-[10px] text-gray-500">{Math.floor(Math.random() * 1000) + 100} posts</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RightSidebar