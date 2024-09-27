"use client"
import { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import io, { Socket } from "socket.io-client";

const Profile = () => {
    const dispatch = useAppDispatch();

    const [account, setAccount] = useState<string>("0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6");
    const socketRef = useRef<Socket | null>(null);

    const users = useAppSelector(state => state.fetchAllUser.users);
    const userProfile = (useAppSelector(state => state.fetchAllUser.users)).find(user => user.address === account);
    const unfollowedUsers = users.filter((item: any) =>
        item.address !== account &&
        !item.followers.some((follower: any) => follower.address === account)
    );
    const followedUsers = users.filter((item: any) =>
        item.address !== account &&
        item.followers.some((follower: any) => follower.address === account)
    );

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

    const handleUnFollow = async (data: any) => {
        try {
            if (account && socketRef.current) {
                socketRef.current.emit("unfollow_user", data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div>
            user profile: {userProfile?.username}
            <div>FOLLOW USERS SECTION</div>
            <div>
                {

                    followedUsers.map((item: any, index) => {
                        const data = {
                            userId: (userProfile as any)?._id,
                            followUserId: item._id
                        }
                        return (
                            <div key={index} className="flex">
                                <div className="pr-4">{index} {item.username}</div>
                                <button type="button" onClick={() => handleUnFollow(data)}>
                                    Unfollow
                                </button>
                            </div>
                        )
                    })
                }
            </div>
            <div>UNFOLLOW USERS SECTION</div>
            <div>
                {

                    unfollowedUsers.map((item: any, index) => {
                        const data = {
                            userId: (userProfile as any)?._id,
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

export default Profile
