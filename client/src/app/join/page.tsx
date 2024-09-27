"use client"
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchPrivateSpace } from "@/lib/features/FetchPrivateSpaceSlice";
import axios from 'axios';
import { privateSpaceType } from '@/types/privateTypes';

const Join = () => {
    const dispatch = useAppDispatch();
    const privateSpaces = (useAppSelector(state => state.fetchPrivateSpace)).privateSpace;

    useEffect(() => {
        dispatch(fetchPrivateSpace())
    }, []);

    const filteredPrivateSpaces = privateSpaces?.filter((space) => {
        if (Array.isArray(space.members)) {
            return space.members.every((member: any) =>
                member.address !== "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6"
            );
        }
        return false;
    });

    console.log(privateSpaces);

    const createPrivateSpace = async () => {
        try {
            const createPrivateSpaceObject = {
                name: "crypto_funk",
                image: "https://thumbor.forbes.com/thumbor/fit-in/900x510/https://www.forbes.com/advisor/wp-content/uploads/2022/06/crypto-glossary.jpeg",
                createdBy: "66f292b2714b25e3f78b1d40",
                entryCondition: {
                    address: "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d7",
                    maxAmount: 100
                },
                interactCondition: {
                    address: "0xd9eb5cfed425152a47a35dcfc43d0acbfb865feba0fc54f20fc6f40903c467d6",
                    maxAmount: 100
                }
            };
            const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/create/private/space`, createPrivateSpaceObject);
            if (resp.status === 201) {
                dispatch(fetchPrivateSpace())
            }
        } catch (error) {
            console.log(error);
        }
    }

    const joinPrivateSpace = async (space: privateSpaceType) => {
        try {
            const entrybalance = 1000; /// contract call for fetching token balance
            if (entrybalance >= space.entryCondition.maxAmount) {
                const resp = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/private/space/join/member`, {
                    privateSpaceId: (space as any)._id,
                    userId: "66f292a6714b25e3f78b1d3d"
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
        <div className='px-5'>
            Join
            <div>
                <button onClick={createPrivateSpace}>create private space</button>
            </div>

            <div>
                {
                    filteredPrivateSpaces?.map((space, index) => {
                        return (
                            <div key={index}>
                                {space.name}: <button onClick={() => joinPrivateSpace(space)}>join {space.name}</button>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Join
