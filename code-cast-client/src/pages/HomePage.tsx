"use client"

import { useState } from "react";
import toast from "react-hot-toast";
import {v4 as uuid} from 'uuid'
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const [roomId, setroomId] = useState("");
    const [UserName, setUserName] = useState("");
    const router = useRouter();

    const generateUUID = (e:any)=>{
        e.preventDefault();
        const id = uuid();
        setroomId(id);
        toast.success("Room Id Generated")
    }

    const joinRoom = ()=>{
        if(!roomId || !UserName){
            toast.error("Both Fields are required!");
            return;
        }

        router.push(`castroom/room-details?id=${roomId}&username=${UserName}`);
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
                        Join Code-cast
                    </h1>
                    <p className="text-center text-gray-500 mb-8">
                        Enter your details to connect with others
                    </p>

                    <form className="space-y-6">
                        <div>
                            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                                Room ID
                            </label>
                            <input
                                value={roomId}
                                onChange={(e) => { setroomId(e.target.value) }}
                                type="text"
                                id="roomId"
                                placeholder="Enter room ID"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <input
                                value={UserName}
                                onChange={(e) => { setUserName(e.target.value) }}
                                type="text"
                                id="username"
                                placeholder="Choose a username"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                                required
                            />
                        </div>

                        <button
                            type="button"
                            onClick={joinRoom}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-150 ease-in-out cursor-pointer"
                        >
                            Join Room
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Or create your own. <button onClick={generateUUID} className="text-purple-600 hover:text-purple-800 font-medium">Create room</button></p>
                    </div>
                </div>
            </div>
        </div>
    );
}