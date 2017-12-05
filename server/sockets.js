const xxh = require('xxhashjs');
const msg = require('./classes/message.js');
const quest = require('./classes/question.js');

let io;

const sockRef = {};

const rooms = {
  // each room has a messages object which contains all of the messages for the current question
  // each room also has a questions object which contains all of the queued questions,
  math: {
    connected: {},
    messages: {},
    questions: [],
    currentQuestion: undefined,
  },
  code: {
    connected: {},
    messages: {},
    questions: [],
    currentQuestion: undefined,
  },
  science: {
    connected: {},
    messages: {},
    questions: [],
    currentQuestion: undefined,
  },
};

const appendRooms = (room, socket) => {
  switch (room) {
    case 'math':
      rooms.math.connected[socket.hash] = socket;
      break;
    case 'code':
      rooms.code.connected[socket.hash] = socket;
      break;
    case 'science':
      rooms.science.connected[socket.hash] = socket;
      break;
    default:
      console.log(`Error appending attepted: ${room}`);
      break;
  }
};
const leaveRooms = (room, socket) => {
  switch (room) {
    case 'math':
      delete rooms.math.connected[socket.hash];
      break;
    case 'code':
      delete rooms.code.connected[socket.hash];
      break;
    case 'science':
      delete rooms.science.connected[socket.hash];
      break;
    default:
      console.log(`Error deleting attepted: ${room}`);
      break;
  }
};

const addToQueue = (data, socket) => {
  // decide what room they are in
  switch (sockRef[socket.hash]) {
    case 'math':
      rooms.math.questions.push(new quest.Question(socket.hash, data));
      break;
    case 'code':
      rooms.code.questions.push(new quest.Question(socket.hash, data));
      break;
    case 'science':
      rooms.science.questions.push(new quest.Question(socket.hash, data));
      break;
    default:
      console.log(`Error in add to queue ${sockRef[socket.hash]}`);
      break;
  }
};
const subtractTime = (room) => {
  switch (room) {
    case 'math':
      rooms.math.currentQuestion.time = 500;
      break;
    case 'code':
      rooms.code.currentQuestion.time = 500;
      break;
    case 'science':
      rooms.science.currentQuestion.time = 500;
      break;
    default:
      console.log(`Error in subtract time`);
      break;
  }
}
const setupSockets = (ioServer) => {
  io = ioServer;
  io.on('connection', (sock) => {
    const socket = sock;
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
    socket.hash = hash;
    // switch between message rooms
    socket.on('joinRoom', (room) => {
      // should check to make sure the room is a valid room here
      if (!sockRef[socket.hash]) {
        sockRef[socket.hash] = room;
        socket.join(room);
        appendRooms(room, socket);
      } else {
        socket.leave(room);
        leaveRooms(room, socket);
        sockRef[socket.hash] = room;
        socket.join(room);
        // maybe check for messages in room and add them in
      }
      // send them the messages and questions;
      if (rooms[sockRef[socket.hash]].currentQuestion !== undefined){
      socket.emit('newQuestion', rooms[sockRef[socket.hash]].currentQuestion);
      socket.emit('allMessages', rooms[sockRef[socket.hash]].messages);
      console.log(rooms[sockRef[socket.hash]].currentQuestion.time);
      }

    });
    socket.on('newQuestion', (data) => {
      // add question to queue
      addToQueue(data, socket);
    });
    socket.on('newMessage', (data) => {
      // create unique id for the message
      const messageID = xxh.h32(`${data.name}${new Date().getTime()}`, 0xBABEFACE).toString(16);
      switch (sockRef[socket.hash]) {
        case 'math':
          rooms.math.messages[messageID] = new msg.Message(data.name, data.message, messageID);
          io.to(sockRef[socket.hash]).emit('msgFromServer', rooms.math.messages[messageID].toOBJ());
          break;
        case 'code':
          rooms.code.messages[messageID] = new msg.Message(data.name, data.message, messageID);
          io.to(sockRef[socket.hash]).emit('msgFromServer', rooms.code.messages[messageID].toOBJ());
          break;
        case 'science':
          rooms.science.messages[messageID] = new msg.Message(data.name, data.message, messageID);
          io.to(sockRef[socket.hash]).emit('msgFromServer', rooms.science.messages[messageID].toOBJ());
          break;
        default:
          console.log('message error');
      }
    });
  });
  // set tick rate for clock updates, and question change checking to every half a second
  setInterval(() => {
    // check if we need to update clients with a new message aka; no question is being answered
    // need to do this for each room,

    const keys = Object.keys(rooms);

    for (let i = 0; i < keys.length; i++) {
      // no question so nothing needs to be done
      if (rooms[keys[i]].questions[0] !== undefined || rooms[keys[i]].currentQuestion !== undefined ) {
        // no question is active
        
        if (rooms[keys[i]].currentQuestion === undefined) {
        // set a new active question
        // remove current question from queue
          const eslintworkaround = 0;
          rooms[keys[i]].currentQuestion = rooms[keys[i]].questions.splice(0, 1)[eslintworkaround];

          // emit new question to clients in this room
          io.to(keys[i]).emit('newQuestion', rooms[keys[i]].currentQuestion);
        } else {
        // increment the internal clock for the question
          rooms[keys[i]].currentQuestion.time -= 500;
          console.log(rooms[keys[i]].currentQuestion.time);
          io.to(keys[i]).emit('newQuestion', rooms[keys[i]].currentQuestion);
          if (rooms[keys[i]].currentQuestion.time === 0) {
            console.log('question time limit reached');
            // questions time has run out, send the owner of the question to the results page
            // add the question asker to a unique room, and remove them from the room they are in
            // const asker = rooms[keys[i]].connected[rooms[keys[i]].currentQuestion.id];
            // asker.leave(rooms[keys[i]]);
            // asker.join(`${asker.hash}`);

            // load a different question to everyone in the room that isnt the owner.
            // we can do this by just setting current question to null
            rooms[keys[i]].currentQuestion = undefined;
          }
        }
      }
    }
  }, 500);
};

module.exports.setupSockets = setupSockets;
