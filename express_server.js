'use strict';
const cookieSession = require('cookie-session');
const express = require('express');
const urlFile = require('./urls');
const app = express();
const PORT = process.env.PORT || 3000; // default port 8080
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

app.use(express.static(__dirname + '/styles'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.use(cookieSession({
  name: "session",
  secret: "somesecret"
}));

//creates a user function
app.use(function(req, res, next){
  res.locals.user = users[req.session.user_id];
  next();
});

let shortUrl;
let users = {};
let loggedIn = {};

//Main url database
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//Generates random string
function generateRandomString() {
  let randomStr = "";
  while(randomStr.length < 6 && 6 > 0){
      let randomNum = Math.random();
      randomStr += (randomNum < 0.1 ? Math.floor( randomNum * 100) : String.fromCharCode(Math.floor(randomNum * 26 ) + (randomNum > 0.5 ? 97 : 65)));
  }
  return randomStr;
}

//Home
app.get('/', (req, res) => {
  !res.locals.user ? res.redirect('login') : res.redirect('urls');
  res.redirect('urls');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  let userId = generateRandomString() + 'ID';
  const useremail = req.body.email;
  const userpassword = req.body.password;
  //encrypt hashed password
  const hashpassword =  bcrypt.hashSync(req.body.password, 10);

  for(var item in users){
    if(users[item].email === useremail){
      res.status(400).send('Email already register');
    }
  }
  //Check for empty string
  if(useremail.length === 0 || userpassword.length === 0){
    res.status(400).send('Empty field');
  }
  users[userId] = {
    id: userId,
    email: useremail,
    password: hashpassword,
    urlsList :[]
  };
  req.session.user_id = '';
  req.session.user_id = userId;
  res.redirect('/');
});

//Main page default
app.get('/urls', (req, res) => {
  let templateVars = {
    data : urlDatabase,
    urlArray : users[req.session.user_id]
  };

  if (req.session.user_id){
    res.status(200);
    res.render('urls_index', templateVars);
    // res.render('partials/_header', templateVars);
  } else {
    res.status(401);
    res.redirect('/login');
  }
});

//New url
app.get('/urls/new', (req, res) => {
  if (!req.session.user_id) {
    res.status(401);
    res.send('<h2>Error! Please Login</h2><a href="/login">login</a>');
  }
  if (req.session.user_id) {
    let templateVars = {
      data : urlDatabase,
      urlArray : users[req.session.user_id]
    };
    res.status(200);
    res.render('urls_new', templateVars);
  }
});

//Creates new url
app.post('/urls/new', (req, res) => {
  if(res.locals.user){
    let longUrl = req.body.longURL;
    shortUrl = generateRandomString();
    if(longUrl.length < 3){
      res.redirect('/urls/new');
    }
    users[req.session.user_id].urlsList.push(shortUrl);
    urlDatabase[shortUrl] = longUrl;
    res.redirect(`/urls/${shortUrl}`);
  }else {
    res.status(401).send('<h2>Error! Please Login</h2><a href="/login">login</a>');
  }

});

//login
app.get('/login', (req, res) => {
  if(res.locals.user){
    res.redirect('/');
  }else {
    let templateVars = {
      data : urlDatabase,
      urlArray : users[req.session.user_id]
    };
    res.render('login', templateVars)
  }
});

app.post('/login', (req, res) => {
  const useremail = req.body.email;
  const userpassword = req.body.password;
  if(users){
    for(var item in users){
      //Checking with encrypted password
      if(users[item].email === useremail && bcrypt.compareSync(userpassword, users[item].password)){
        req.session.user_id = users[item].id;
        req.session.username = users[item].email;

        res.redirect('/');
      } else {
          res.status(401).send('<h1>wrong username or password</h1><a href="/">Return to main</a>')
      }
    }
  } else {
    res.status(401).send('<h1>wrong username or password</h1><a href="/">Return to main</a>')
  }

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.locals = null;
  res.redirect('/');
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const userId = req.params.id;

  let templateVars = {
    shortUrl: userId,
    longUrl: urlDatabase[userId]
  }
  function scanUrl(x){
    for(var i in users){
      if(users[i].urlsList.includes(x)){
        return true
      }
    }
    return false
  }

  if(user){
    res.status(200)
    if(user.urlsList.includes(req.params.id)){
      // default case urls_show
      console.log('You have this in you database!')
      res.render('urls_show', templateVars)
    } // scan arrays in database matching for matching urls
    else if(scanUrl(req.params.id)){
      res.status(403).send('<h2>it is in another database</h2>')
    }
    else{//User does not have this in database, its in another's
      res.status(404).send('Item does not exist in database')
    }
  }else {//Users not login
    res.status(401).send('<h2>Error! Please Login</h2><a href="/login">login</a>')

  }
});

// Delete
app.post('/urls/:id/delete', (req, res) => {
  if(users[req.session.user_id].urlsList.includes(req.params.id)){
    let idDelete = req.params.id
    delete urlDatabase[idDelete]
  }
  let array = users[req.session.user_id].urlsList
  let indexToDelete = array.indexOf(req.params.id)
  array.splice(indexToDelete, 1)
  res.redirect('/urls')
});

app.post('/urls/:id/update', (req, res) => {
  console.log('Trying to PUT for UPDATE!')
  let idUpdate = req.params.id
  urlDatabase[idUpdate] = req.body.user_name
  res.redirect('/urls')
});

app.get('/u/:shortUrl', (req, res) => {

console.log(urlDatabase.hasOwnProperty(req.params.shortUrl))
  if(!urlDatabase.hasOwnProperty(req.params.shortUrl)){
    return res.status(404).send('<h2>Unknown url submitted</h2><a href="/">Return to main</a>')
  }
  if(req.params.shortUrl){
    const userUrl = req.params.shortUrl;
    let longUrl = urlDatabase[req.params.shortUrl];
    res.redirect(longUrl);
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});