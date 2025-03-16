import express from 'express'
import http from 'http'
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors'
import axios from 'axios';

dotenv.config({});

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:'http://localhost:3000',
        methods:['GET','POST'],
    }
});


const languageConfig = {
    python3: { versionIndex: "3" },
    java: { versionIndex: "3" },
    cpp: { versionIndex: "4" },
    nodejs: { versionIndex: "3" },
    c: { versionIndex: "4" },
    ruby: { versionIndex: "3" },
    go: { versionIndex: "3" },
    scala: { versionIndex: "3" },
    bash: { versionIndex: "3" },
    sql: { versionIndex: "3" },
    pascal: { versionIndex: "2" },
    csharp: { versionIndex: "3" },
    php: { versionIndex: "3" },
    swift: { versionIndex: "3" },
    rust: { versionIndex: "3" },
    r: { versionIndex: "3" },
  };

let userSocketMap = {}; 

const getAllConnectedClients = (roomId)=>{
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId)=>{
            return {
                socketId,
                username: userSocketMap[socketId],
            }
        }
    )
}

io.on('connection',(socket)=>{
    console.log((`user connected : ${socket.id}`));
    
    socket.on('join',({id,userName})=>{        
        userSocketMap[socket.id] = userName;
        socket.join(id);
        const clients = getAllConnectedClients(id);
        clients.forEach(({socketId})=>{
            io.to(socketId).emit('joined',{
                clients,
                username:userName,
                socketId:socket.id,
            })
        })
    });

    socket.on('code-change',({roomId,code})=>{
        socket.in(roomId).emit('code-change',{code});
    })
    socket.on('sync-code',({socketId,code})=>{
        
        io.to(socketId).emit('code-change-again',{code});
        
    })

    socket.on("disconnecting", () => {
        const rooms = [...socket.rooms];
        // leave all the room
        rooms.forEach((roomId) => {
          socket.in(roomId).emit('disconnected', {
            socketId: socket.id,
            username: userSocketMap[socket.id],
          });
        });
    
        delete userSocketMap[socket.id];
        socket.leave();
      });
});


app.post("/api/compile", async (req, res) => {
    const { code, language } = req.body;
  
    try {
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        script: code,
        language: language,
        versionIndex: languageConfig[language].versionIndex,
        clientId: process.env.JODDLE_CLIENT_ID,
        clientSecret: process.env.JODDLE_CLIENT_SECRET,
      });
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to compile code" });
    }
  });

const PORT  = process.env.PORT || 5000;
server.listen(PORT,()=> console.log(`server is running ${PORT}`)
);
