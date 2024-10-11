"use client"
import React, { useState, useEffect, useRef, } from 'react';
import io, { Socket } from "socket.io-client";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

import { fetchAllPost } from "@/lib/features/FetchAllPostSlice";
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { parsePathForPostData } from "@/utils/helper";
import CreatePost from './CreatePost'
import Post from './PostComponent'

export default function FeedContent() {
  // const path = usePathname();
  const path = "/home";

  // const address = (useWallet()).account?.address;
  const account = "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6";

  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const posts = useAppSelector(state => state.fetchAllPost.posts);
  const userProfile = (useAppSelector(state => state.fetchAllUser.users)).find(user => user.address === account);
  const { space, privateSpaceId, channel } = parsePathForPostData(path);

  useEffect(() => {
    dispatch(fetchAllUsers())
    checkAuthStatus();
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
    if (isAuthenticated && socketRef.current && userProfile) {
      socketRef.current.emit("join_space", { space: "public" });
      socketRef.current.on("fetch_post", (post) => {
        dispatch(fetchAllPost(post));
      });
      socketRef.current.on("public_user", (data: any) => {
        setUsers(data?.users);
      });
      dispatch(fetchAllPost({ space: space, privateSpaceId: privateSpaceId, channel: channel, userId: (userProfile as any)?._id }));
      fetchAllUser();
    }
  }, [isAuthenticated, userProfile])

  const fetchAllUser = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/all/users`);
      setUsers(res.data?.users);
    } catch (error) {
      console.log(error);
    }
  }

  const checkAuthStatus = async () => {
    try {
      const isAuth = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/${account}`))?.data?.isAuth;
      if (!isAuth) {
        router.push('/register');
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  return (
    <div className="space-y-4">
      <CreatePost
        socketRef={socketRef}
        isAuthenticated={isAuthenticated}
        account={account}
        space={space}
        privateSpaceId={privateSpaceId}
        channel={channel}
      />

      {posts && posts.map(post => (
        <Post
          post={post}
          account={account}
          socketRef={socketRef}
          key={(post as any)._id}
          isAuthenticated={isAuthenticated}
          space={space}
          privateSpaceId={privateSpaceId}
          channel={channel}
        />
      ))}
    </div>
  )
}