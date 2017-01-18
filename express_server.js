'use strict';
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  'LJrxqw': 'http://johnkmeas.github.io/main-portfolio'
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
  res.end('Hello!');
});
app.get('/urls', (req, res) => {
  // console.log("loading GET /urls");
  let templateVars = { urls: urlDatabase};
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  console.log("loading GET /urls/:id");
  let templateVars = {
    shortURL: req.params.id,
    longUrl: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});



app.post('/urls', (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send('Ok');         // Respond with 'Ok' (we will replace this)
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
