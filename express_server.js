'use strict';
const express = require('express');
const urlFile = require('./urls');
const app = express();
var cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashed_password = bcrypt.hashSync(password, 10);

app.use(cookieParser())
app.use(express.static(__dirname + '/styles'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

app.use(function(req, res, next){
  res.locals.user = users[req.cookies.user_id]
  next()
})

let shortUrl;
let users = {};
let loggedIn = {};
let amount = 0;
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

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {
  let userId = generateRandomString() + 'ID';
  const useremail = req.body.email
  const userpassword = req.body.password
  const hashpassword =  bcrypt.hashSync(req.body.password, 10);

  console.log('Usersid', userId)
  for(var item in users){
    if(users[item].email === useremail){
      return res.status(400).send('Email already register')
    }
  }
  if(useremail.length === 0 || userpassword.length === 0){
    return res.status(400).send('Empty')
  }
  users[userId] = {
    id: userId,
    email: useremail,
    password: hashpassword,
    urlsList :[]
   }
   console.log(users)
   res.cookie('user_id', userId )
  res.redirect('/');
})

app.get('/urls', (req, res) => {
  console.log("loading GET /urls");
  // console.log('User id from user ',  req.cookies.user_id)
  console.log('Users ID for database:', req.cookies.user_id)
  console.log('cookies collection:', users[req.cookies.user_id])

  let templateVars = {
    data : urlDatabase,
    urlArray : users[req.cookies.user_id]
  };

  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  console.log("loading GET /urls/new");
  res.render('urls_new');
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
  // users[user.user_id] = {
  //   id: userId,
  //   email: useremail,
  //   password: userpassword
  // }
  // users
  // req.cookies.user_id
  amount += 1;
  users[req.cookies.user_id].urlsList.push(shortUrl)
  //console.log(users)
  urlDatabase[shortUrl] = longUrl
  // console.log(urlDatabase)
  console.log('-----------')
  res.redirect(`/urls/${shortUrl}`);
});

app.get('/login', (req, res) => {
  res.render('login')
});

app.post('/login', (req, res) => {
  const useremail = req.body.email;
  const userpassword = req.body.password;
  // bcrypt.compareSync(userpassword, hashed_password);
  for(var item in users){
    if(users[item].email === useremail && bcrypt.compareSync(userpassword, users[item].password)){
      console.log('Login Successful')
      console.log('Check for hash',users)
      loggedIn = users[item]
      res.cookie('user_id', users[item].id, 'username', users[item].email)
      res.redirect('/');

    }
  }
  for(var item in users){
    if(users[item].email !== useremail && users[item].password !== userpassword){
      console.log('Wrong Username or password')
      return res.status(400).send('wrong username or password')
    }
  }
  // console.log(users)
  res.redirect('/');
});

app.post('/logout', (req, res) => {

  res.cookie('user_id', ''); // set cookies username
  // console.log(req.cookies['username'])
  res.redirect('/');
});

app.post('/urls/:id/delete', (req, res) => {

  // console.log("before delete");
  // console.log("URLs:", urlDatabase);
  // console.log("users:", users);
  // console.log("Id of ORGINAL user: =>", req.cookies.user_id, req.params.id)
  if(users[req.cookies.user_id].urlsList.includes(req.params.id)){
    let idDelete = req.params.id
    delete urlDatabase[idDelete]
  }

  // delete urlDatabase[idDelete]
  // console.log(users)
  let array = users[req.cookies.user_id].urlsList
  let indexToDelete = array.indexOf(req.params.id)
  array.splice(indexToDelete, 1)  // wait, what if indexToDelete is -1 ?  that'll suck

  // console.log('-------------------++++')
  // console.log(users[req.cookies.user_id].urlsList.indexOf(req.params.id))
  //
  //
  // console.log("after delete");
  // console.log("URLs:", urlDatabase);
  // console.log("users:", users);

  //console.log(urlDatabase)
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
  console.log(urlDatabase[req.params.shortUrl])
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
