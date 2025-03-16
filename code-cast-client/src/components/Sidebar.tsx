"use client"

type User = {
  socketId: number;
  username: string;
};

type Sideprop = {
  isOpen: boolean,
  toggleSidebar: () => void;
  users:User[],
  roomId:any
};

import { ChevronLeft, ChevronRight, Users} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Sidebar({ isOpen, toggleSidebar, users, roomId }:Sideprop) {
  const copyRoomId = async()=>{
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied")
    } catch (error) {
      toast.error("Unable to copy!")
    }
  }
  const router = useRouter();
  const LeaveRoom = ()=>{
    router.push('/');
  }
  return (
    <div 
      className={`h-full bg-gray-800 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen && <h2 className="font-bold">Room Controls</h2>}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              className="flex items-center px-4 py-2 hover:bg-gray-700 transition-colors"
            >
              <Users size={20} />
              {isOpen && <span className="ml-3">Participants</span>}
            </a>
            <div className='flex flex-col gap-2 px-2 py-1'>
            {users.map((user) => (
                  <div 
                    key={user.socketId} 
                    className="flex items-center px-2 py-1 rounded-md bg-gray-700 text-sm"
                  >
                    {isOpen && <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>}
                    <span className="truncate">{user.username}</span>
                  </div>
                ))}
            </div>
          </li>
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700 mx-auto">
        {isOpen && (
          <div className="text-sm text-gray-400 gap-2 flex flex-col">
            <div>
            <button onClick={copyRoomId} className='text-sm font-bold bg-blue-500 hover:bg-blue-600 cursor-pointer p-2 text-white rounded-md'>Copy Room Id</button>
            </div>
            <div>
              <button onClick={LeaveRoom} className='text-lg font-bold bg-red-500 hover:bg-red-600 cursor-pointer p-2 text-white rounded-md'>
                Leave room
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}