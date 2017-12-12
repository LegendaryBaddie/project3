const xxh = require('xxhashjs');
const msg = require('./classes/message.js');
const quest = require('./classes/question.js');
const controllers = require('./controllers');

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

const generateSummary = (room) => {
  // highest rated message
  const highestMerit = 0;
  const highestMessage = {};
  const messageKeys = Object.keys(rooms[room].messages);
  for (let i = 0; i < messageKeys.length; i++) {
    if (rooms[room].messages[messageKeys[i]].stars >= highestMerit) {
      highestMessage[i] = rooms[room].messages[messageKeys[i]];
    }
  }
  // if no one upvoted at all
  if (highestMessage === 0) {
    return rooms[room].messages;
  }
  const data = {
    highestMessage,
    messages: rooms[room].messages,
  };
  return data;

  // all messages
};

const setupSockets = (ioServer) => {
  io = ioServer;
  io.on('connection', (sock) => {
    const socket = sock;
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
    socket.hash = hash;
    // add sockets to a room of their hash, so we can contact single sockets later.
    socket.join(socket.hash);
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
      if (rooms[sockRef[socket.hash]].currentQuestion !== undefined) {
        socket.emit('newQuestion', rooms[sockRef[socket.hash]].currentQuestion);
        if (rooms[sockRef[socket.hash]].messages !== undefined) {
          socket.emit('allMessages', rooms[sockRef[socket.hash]].messages);
        }
      }
    });
    socket.on('extendClock', (data) => {
      // if the doesnt owns the question
      if (socket.hash !== rooms[sockRef[socket.hash]].currentQuestion.id) {
        return;
      }
      // return if the user doesnt have enough merits
      if (controllers.Account.checkMerits(data) >= 100) {
        controllers.Account.updateMerits(data, -100);
        rooms[sockRef[socket.hash]].currentQuestion.time += 60000;
        io.to(sockRef[socket.hash]).emit('clockExtension');
      }
    });
    socket.on('addMerit', (data) => {
      // data coming is the message id
      // check to see if the message even exists
      if (!rooms[sockRef[socket.hash]].messages[data]) {
        return;
      }

      if (rooms[sockRef[socket.hash]].messages[data].hasUpvoted[socket.hash]) {
        return;
      }
      rooms[sockRef[socket.hash]].messages[data].hasUpvoted[socket.hash] = socket.hash;
      rooms[sockRef[socket.hash]].messages[data].stars++;
      io.to(sockRef[socket.hash]).emit('allMessages', rooms[sockRef[socket.hash]].messages);
    });
    socket.on('newQuestion', (data) => {
      // add question to queue
      addToQueue(data, socket);
      // update questions in queue

      io.to(sockRef[socket.hash]).emit('queueUpdate', rooms[sockRef[socket.hash]].questions.length);
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
      // no question is active
      if (rooms[keys[i]].currentQuestion === undefined
                && rooms[keys[i]].questions[0] !== undefined) {
        // set a new active question
        // remove current question from queue
        const eslintworkaround = 0;
        rooms[keys[i]].currentQuestion = rooms[keys[i]].questions.splice(0, 1)[eslintworkaround];
        // update client questoin queue
        io.to(keys[i]).emit('queueUpdate', 0);
        // emit new question to clients in this room
        io.to(keys[i]).emit('newQuestion', rooms[keys[i]].currentQuestion);
      } else if (rooms[keys[i]].currentQuestion !== undefined) {
        // increment the internal clock for the question
        rooms[keys[i]].currentQuestion.time -= 500;
        // io.to(keys[i]).emit('timerUpdate', rooms[keys[i]].currentQuestion.time);
        if (rooms[keys[i]].currentQuestion.time === 0) {
          // questions time has run out, send the owner of the question to the results page
          // add the question asker to a unique room, and remove them from the room they are in
          // check if there is any messages to get for a summary
          if (rooms[keys[i]].messages !== {}) {
            const summary = generateSummary(keys[i]);
            io.to(rooms[keys[i]].currentQuestion.id).emit('summary', summary);
          }

          // save all the merits of each message to its owner.
          const messageKeys = Object.keys(rooms[keys[i]].messages);
          for (let k = 0; k < messageKeys.length; k++) {
            // if the message has merits to add
            if (rooms[keys[i]].messages[messageKeys[k]].stars > 0) {
              controllers.Account.updateMerits(
                rooms[keys[i]].messages[messageKeys[k]].name,
                rooms[keys[i]].messages[messageKeys[k]].stars,
              );
            }
          }
          // clear the messages object
          rooms[keys[i]].messages = {};
          // load a different question to everyone in the room that isnt the owner.
          // we can do this by just setting current question to null
          rooms[keys[i]].currentQuestion = undefined;
          // update queue
          io.to(keys[i]).emit('queueUpdate', rooms[keys[i]].questions.length);
          // tell the clients to reset their question and time
          io.to(keys[i]).emit('resetQuestion');
        }
      }
    }
  }, 500);
};

module.exports.setupSockets = setupSockets;
