'use strict';
const express = require('express');
const app = express();
var cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');

app.use(cookieParser())
app.use(express.static(__dirname + '/styles'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')


let shortUrl;
let user;


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

function generateRandomString() {
  let randomStr = "";
  while(randomStr.length < 6 && 6 > 0){
      let randomNum = Math.random();
      randomStr += (randomNum < 0.1 ? Math.floor( randomNum * 100) : String.fromCharCode(Math.floor(randomNum * 26 ) + (randomNum > 0.5 ? 97 : 65)));
  }
  return randomStr;
}

app.get('/', (req, res) => {
  // res.send(req.cookies);
  res.redirect('urls');
});

app.get('/urls', (req, res) => {
  console.log("loading GET /urls");
  let templateVars = {
    urls: urlDatabase,
    username:  req.cookies['username']
    // ... any other vars
  };
  res.locals.user
  //console.log(urlDatabase);
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  console.log("loading GET /urls/new");
  let templateVars = {
    username:  req.cookies['username']
    // ... any other vars
  };
  res.render('urls_new', templateVars);
});

app.post('/urls/new', (req, res) => {
  console.log("loading GET /urls/create");
  let longUrl = req.body.longURL
  shortUrl = generateRandomString()
  console.log('longUrl: ', longUrl, 'shortUrl:', shortUrl)
  if(longUrl.length < 3){
    console.log('Invalid URL')
    res.redirect('/urls/new');
  }
  let templateVars = {

    username:  req.cookies['username']
    // ... any other vars
  };
  urlDatabase[shortUrl] = longUrl
  res.redirect(`/urls/${shortUrl}`, templateVars);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  //console.log(res.cookie('username', username))
  res.cookie('username', username); // set cookies username
  req.cookies['username']
  let templateVars = {
    username:  req.cookies['username']
    // ... any other vars
  };
  res.redirect('/');
});
app.post('/logout', (req, res) => {

  res.cookie('username', ''); // set cookies username
  console.log(req.cookies['username'])
  res.redirect('/');
});

app.post('/urls/:id/delete', (req, res) => {
  let idDelete = req.params.id
  delete urlDatabase[idDelete]
  console.log(urlDatabase)
  res.redirect('/urls')
});

app.post('/urls/:id/update', (req, res) => {
  let idUpdate = req.params.id
  urlDatabase[idUpdate] = req.body.user_name
  console.log( urlDatabase)
  res.redirect('/urls')
});

app.get('/u/:shortUrl', (req, res) => {
  console.log('this is the short redirect!')
  let longUrl = urlDatabase[req.params.shortUrl];
  res.redirect(longUrl);
});

app.get('/urls/:id', (req, res) => {
  console.log("loading GET /urls/:id");
  let templateVars = {
    shortURL: req.params.id,
    longUrl: urlDatabase[req.params.id]
  };
  console.log("longUrl: ");
  res.render('urls_show', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
