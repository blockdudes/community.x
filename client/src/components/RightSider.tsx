"use client"

import { useEffect, useState, useRef } from 'react'
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchPrivateSpace } from "@/lib/features/FetchPrivateSpaceSlice";
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import io, { Socket } from "socket.io-client";
import { privateSpaceType } from '@/types/privateTypes';
import axios from 'axios';

const RightSider = () => {

    const [account, setAccount] = useState<string>("0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6");
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
        <div>
            <div>
                {
                    filteredPrivateSpaces?.map((space, index) => {
                        return (
                            <div>
                                {space.name}: <button onClick={() => joinPrivateSpace(space)}>join {space.name}</button>
                            </div>
                        )
                    })
                }
            </div>
            <div>
                {
                    unfollowedUsers.map((item: any, index) => {
                        const data = {
                            userId: (userProfile as any)._id,
                            followUserId: item._id
                        }
                        return (
                            <div key={index} className="flex">
                                <div className="pr-4">{index} {item.username}</div>
                                <button type="button" onClick={() => handleFollow(data)}>
                                    Follow
                                </button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default RightSider
