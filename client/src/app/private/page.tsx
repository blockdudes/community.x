"use client"
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PrivateSpace {
    channels: any[];
}

const Private = () => {

    const [privateSpace, setPrivateSpace] = useState<PrivateSpace | null>(null);
    const router = useRouter();

    const createPrivate = async () => {
        try {

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getPrivateSpace();
    }, [])

    const getPrivateSpace = async () => {
        try {
            const resp = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/get/private/space/66f3c531ce2e126d7f90dc11`);
            setPrivateSpace(resp.data.privateSpace);
        } catch (error) {
            console.log(error);
        }
    }

    console.log(privateSpace);

    return (
        <div>
            Private Space
            {
                privateSpace?.channels.map((channel, index) => {
                    return (
                        <div key={index} onClick={() => router.push(`/private/${channel.type}`)}>{channel.type}</div>
                    )
                })
            }
        </div>
    )
}

export default Private
