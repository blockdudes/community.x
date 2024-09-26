"use client"
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchPrivateSpace } from "@/lib/features/FetchPrivateSpaceSlice";
import Link from 'next/link';

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;

    useEffect(() => {
        dispatch(fetchPrivateSpace())
    }, []);

    return (
        <div className="w-[200px] border text-white">
            <div className="flex flex-col justify-start items-start">
                <Link href="/">Public</Link>
                {
                    privateSpaces?.map((privateSpace, index) => {
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
            </div>
        </div>
    )
}

export default Sidebar