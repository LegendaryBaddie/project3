const xxh = require('xxhashjs');
const msg = require('./classes/message.js');
let io;

const rooms = {
    math: {
        messages: {}
    },
    code: {
        messages: {}
    },
    science: {
        messages: {}
    }
};

const appendRooms = (room, socket) => {
    switch (room) {
        case 'math':
            rooms.math[socket.hash] = socket;
            break;
        case 'code':
            rooms.code[socket.hash] = socket;
            break;
        case 'science':
            rooms.science[socket.hash] = socket;
            break;
        default :
            console.log(`Error appending attepted: ${room}`);
            break;
    }
}
const leaveRooms = (room, socket) => {
    switch (room) {
        case 'math':
            delete rooms.math[socket.hash];
            break;
        case 'code':
            delete rooms.code[socket.hash];
            break;
        case 'science':
            delete rooms.science[socket.hash];
            break;
        default :
            console.log(`Error deleting attepted: ${room}`);
            break;
    }
}

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
                appendRooms(room, socket);
            }else{
                socket.leave(room);
                leaveRooms(room, socket);
                socket.room = room;
                socket.join(room);
                //maybe check for messages in room and add them in
            }
            console.dir(`${socket.hash} joined ${socket.room}`);
        });
        socket.on('newQuestion', (data)=>{
            //add question to queue
            addToQueue(data, socket.hash);
            //save socket hash to the question
        });
        socket.on('newMessage', (data) => {
            //create unique id for the message
            const messageID = xxh.h32(`${data.name}${new Date().getTime()}`, 0xBABEFACE).toString(16);
            switch(socket.room){
                case 'math':
                    rooms.math.messages[messageID] = new msg.Message(data.name, data.message, messageID);
                    io.to(socket.room).emit('msgFromServer', rooms.math.messages[messageID].toOBJ());
                    break;
                case 'code':
                    rooms.code.messages[messageID] = new msg.Message(data.name, data.message, messageID);
                    io.to(socket.room).emit('msgFromServer', rooms.code.messages[messageID].toOBJ());
                    break;
                case 'science':
                    rooms.science.messages[messageID] = new msg.Message(data.name, data.message, messageID);
                    io.to(socket.room).emit('msgFromServer', rooms.science.messages[messageID].toOBJ());
                    break;
                default:
                    console.log('message error');
            }
        });
    });
};

module.exports.setupSockets = setupSockets;
