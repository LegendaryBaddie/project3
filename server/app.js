const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const handlebars = require('express-handlebars');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');
const http = require('http');
const sockets = require('./sockets.js');
const router = require('./router.js');

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/Project3';

mongoose.connect(dbURL, { useMongoClient: true }, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

let redisURL = {
  hostname: 'localhost',
  port: 6379,
};

let redisPASS;
// stupid eslint error workaround
const someIndex = 1;
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPASS = redisURL.auth.split(':')[someIndex];
}

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/assets`)));
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPASS,
  }),
  secret: 'The Answer is 42',
  resave: true,
  saveUninitialized: true,
}));
app.engine('handlebars', handlebars({
  defaultLayout: path.resolve(`${__dirname}/../hosted/views/layouts/main`),
}));
app.set('view engine', 'handlebars');
app.set('views', path.resolve(`${__dirname}/../hosted/views`));
app.disable('x-powered-by');
app.use(cookieParser());
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  return false;
});
const server = http.createServer(app);
const io = socketio(server);


router(app);

sockets.setupSockets(io);

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${PORT}`);
});
