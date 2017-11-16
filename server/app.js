const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const handlebars = require('express-handlebars');
const http = require('http');
const sockets = require('./sockets.js');
const router = require('./router.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/assets`)));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', path.resolve(`${__dirname}/../hosted/views`));
const io = socketio(http.createServer(app));

router(app);

sockets.setupSockets(io);

app.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${PORT}`);
});
