"use client"
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchPrivateSpace } from "@/lib/features/FetchPrivateSpaceSlice";
import { fetchAllUsers } from "@/lib/features/FetchAllUsersSlice";
import Link from 'next/link';

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;
    const [account, setAccount] = useState<string>("0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6");

    useEffect(() => {
        dispatch(fetchPrivateSpace())
        dispatch(fetchAllUsers())
    }, []);

    const filteredPrivateSpaces = privateSpaces?.filter((space) => {
        if (Array.isArray(space.members)) {
            return space.members.some((member: any) =>
                member.address === account
            );
        }
        return false;
    });

    return (
        <div className="w-[200px] border text-white">
            <div className="flex flex-col justify-start items-start">
                <Link href="/">Public</Link>
                {
                    filteredPrivateSpaces?.map((privateSpace, index) => {
                        return (
                            <div key={index}>
                                {privateSpace.name}
                                <div className="ml-3">
                                    {
                                        privateSpace.channels.map((channel, indexx) => {
                                            return (
                                                <div key={indexx}>
                                                    <Link href={`/private/${(privateSpace as any)._id}/${channel.type}`}>{channel.type}</Link>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        )
                    })
                }
                <Link href="/join">Join</Link>
                <Link href={`/profile/${account}`}>Profile</Link>
            </div>
        </div>
    )
}

export default Sidebar