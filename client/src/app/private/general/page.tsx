"use client";
import { useRef, useEffect } from 'react'
import io, { Socket } from "socket.io-client";

const General = () => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // checkAuthStatus();
        if (!socketRef.current) {
            socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_API_URL as string);
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }

    }, []);


    return (
        <div>
            General
        </div>
    )
}

export default General
