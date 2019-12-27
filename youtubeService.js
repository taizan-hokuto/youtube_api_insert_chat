// youtubeService.js
const util = require('util');
const fs = require('fs');
const writeFilePromise = util.promisify(fs.writeFile);
const readFilePromise = util.promisify(fs.readFile);
const { google } = require('googleapis');
const youtube = google.youtube('v3');
const OAuth2 = google.auth.OAuth2;

const scope = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

const TOKEN_PATH = './token.json';
const CLIENT_SECRET_PATH  ='./client_secret_test.json'

let text = fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8');
credentials  =JSON.parse(text);

const clientSecret = credentials.web.client_secret;
const clientId = credentials.web.client_id;
const redirectUrl = credentials.web.redirect_uris[0];
const auth = new OAuth2(clientId, clientSecret, redirectUrl);
  

const youtubeService = {};
//---------------------------------------------------------------------------------------------------


const save = async (path, str, message) => {
  await writeFilePromise(path, str);
  console.log('Successfully Saved: '+ message);
};

const read = async path => {
  const fileContents = await readFilePromise(path);
  return JSON.parse(fileContents);
};


//*********************************
//     Find the live chat Id
//*********************************
let liveChatId; 
let nextPage; 
const intervalTime = 10000; 
let interval; 
let chatMessages = []; 

youtubeService.findActiveChat = async (videoId) => {
  
    const response = await youtube.videos.list({
    auth,
    id: videoId,
    part:'liveStreamingDetails'
  });
  const latestChat = response.data.items[0];
  liveChatId = latestChat.liveStreamingDetails.activeLiveChatId;
  console.log('Chat ID Found:', liveChatId)
};




//*********************************
//     Insert chat messages
//*********************************

youtubeService.insertMessage = (mes) => {
  
  youtube.liveChatMessages.insert(
    {
      auth,
      part: 'snippet',
      resource: {
        snippet: {
          type: 'textMessageEvent',
          liveChatId,
          textMessageDetails: {
            messageText : mes
          }
        }
      }
    },
    (err) => {
        if (err){ console.log(err); }
    }
  );
}
//---------------------------------------------------------------------------------------------------


youtubeService.getCode = response => {
  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope
  });
  response.redirect(authUrl);
};

//callback called from youtube
youtubeService.getTokensWithCode = async code => {
  const credentials = await auth.getToken(code);
  youtubeService.authorize(credentials);
};

youtubeService.authorize = ({ tokens }) => {
  auth.setCredentials(tokens);
  console.log('Successfully set credentials');
  save(TOKEN_PATH, JSON.stringify(tokens), "credential tokens");
};


auth.on('tokens', (tokens) => {
  if (tokens.refresh_token) {

 save(TOKEN_PATH, JSON.stringify(auth.tokens), "refreshed tokens");
 
  }
});

const checkTokens = async () => {
    try{
    const tokens = await read(TOKEN_PATH);
    if (tokens) {
      auth.setCredentials(tokens);
      console.log('tokens set');
    } else {
      console.log('no tokens set');
    }
  }catch(e){
    console.log("token.jsonがありません")
    console.log("認証ボタンをクリックしてgoogleアカウントでログインし、アプリを承認してください")
  }
};
checkTokens();


module.exports = youtubeService;