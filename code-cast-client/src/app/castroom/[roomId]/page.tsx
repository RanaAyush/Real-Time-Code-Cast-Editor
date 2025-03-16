"use client"

import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Editor from '@/components/Editor';
import { useRouter, useSearchParams } from 'next/navigation';
import { initSocket } from '@/config/scoket';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import axios from 'axios';


type User = {
  socketId: number;
  username: string;
};

const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "c",
  "ruby",
  "go",
  "bash",
  "sql",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

export default function CastingRoom() {
  const socketRef = useRef<Socket | null>(null);
  const codeRef = useRef(null);
  const searchParams = useSearchParams();
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");

  const id = searchParams?.get('id');
  const userName = searchParams?.get('username');

  const router = useRouter();

  const handleError = (e: any) => {
    console.log("scoket error", e);
    toast.error("socket error");
    router.push('/')
  }
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => { handleError(err) });
      socketRef.current.on('connect_failed', (err) => { handleError(err) });
      socketRef.current.emit('join', {
        id,
        userName
      })
      socketRef.current.on('joined', ({ clients, username, socketId }) => {
        if (username != userName) {
          toast.success(`${username} joined`)
        }
        setUsers(clients)
        socketRef.current?.emit('sync-code', {
          code: codeRef.current,
          socketId
        })
      });
      socketRef.current.on('disconnected', ({ socketId, username }) => {
        toast.success(`${username} left room`);
        setUsers((prev) => {
          return prev.filter(
            (client) => client.socketId != socketId
          )
        })
      })
    }
    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off('joined');
      socketRef.current?.off('disconnected');
    }
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCodeChange = (code: any) => {
    codeRef.current = code;
  }
  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/api/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      // setOutput(error?.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} users={users} roomId={id} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 mr-4 flex justify-end gap-4">
          <select
            className="w-auto"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            className="bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold p-2 cursor-pointer"
            onClick={toggleCompileWindow}
          >
            {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
          </button>
        </div>
        <Editor socketRef={socketRef} roomId={id} onCodeChange={handleCodeChange} />
      </div>

      {/* Compiler section */}
      <div
        className={`bg-gray-900 text-white p-3 ${isCompileWindowOpen ? "block" : "hidden"
          }`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 40,
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h5 className="m-0">Compiler Output ({selectedLanguage})</h5>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${isCompiling
                  ? "bg-green-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
                } text-white cursor-pointer`}
              onClick={runCode}
              disabled={isCompiling}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-white cursor-pointer"
              onClick={toggleCompileWindow}
            >
              Close
            </button>
          </div>
        </div>
        <pre className="bg-gray-800 p-3 rounded">
          {output || "Output will appear here after compilation"}
        </pre>
      </div>
    </div>
  );
}