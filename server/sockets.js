const xxh = require('xxhashjs');

let io;

const rooms = {
    math: [],
    code: [],
    science: []
};

const setupSockets = (ioServer) => {
    io = ioServer;
    io.on('connection', (sock) =>{
        const socket = sock;
        const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
        socket.hash = hash;
        //switch between message rooms
        socket.on('joinRoom', (room) => {
            //should check to make sure the room is a valid room here
            if(!socket.room){
                socket.room = room;
                socket.join(room);
            }else{
                socket.leave(room);
                socket.room = room;
                socket.join(room);
                //maybe check for messages in room and add them in
            }
            console.dir(`${socket.hash} joined ${socket.room}`);
        });
        
        socket.on('newMessage', (data) => {
            
        });
    });
};

module.exports.setupSockets = setupSockets;
