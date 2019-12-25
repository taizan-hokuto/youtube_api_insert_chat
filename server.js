// server.js
const youtubeService = require('./youtubeService.js');
const express = require('express');
const path = require('path');
const server = express();
const bodyParser = require('body-parser')


server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

server.get('/', (req, res) =>
  res.sendFile(path.join(__dirname + '/index.html'))
);

server.get('/authorize', (req, response) => {
  console.log('/auth');
  youtubeService.getCode(response);
});

server.get('/callback', (req, response) => {
  const { code } = req.query;
  youtubeService.getTokensWithCode(code);
  response.redirect('/');
});


server.post('/find-active-chat', (req, res) => {
  console.log(req.body.videoId);
  youtubeService.findActiveChat(req.body.videoId);
 res.redirect('/');
});


server.post('/post_message', (req, res) => {
  youtubeService.insertMessage(req.body.message);
  res.redirect('/');
});

server.listen(3000, function() {
  console.log('Server is Ready');
});
