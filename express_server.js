'use strict';
const cookieSession = require('cookie-session')
const express = require('express');
const urlFile = require('./urls');
const app = express();
// var cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require('body-parser');

const bcrypt = require('bcrypt');
// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
// const hashed_password = bcrypt.hashSync(password, 10);

// app.use(cookieParser())
app.use(express.static(__dirname + '/styles'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs')

//
app.use(cookieSession({
  name: "session",
  secret: "somesecret"
}));

//creates a user function
app.use(function(req, res, next){
  res.locals.user = users[req.session.user_id]
  console.log(req.session.user_id)
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
//Generates random string
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
  !res.locals.user ? res.redirect('login') : res.redirect('urls');
  console.log('res.locals.user: ', res.locals.user);
  console.log('users[req.session.user_id]: ', users[req.session.user_id])
  res.redirect('urls');
});


app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {
  let userId = generateRandomString() + 'ID';
  const useremail = req.body.email
  const userpassword = req.body.password
  //encrypt hashed password
  const hashpassword =  bcrypt.hashSync(req.body.password, 10);

  console.log('Usersid', userId)
  for(var item in users){
    if(users[item].email === useremail){
      return res.status(400).send('Email already register')
    }
  }
  //Check for empty string
  if(useremail.length === 0 || userpassword.length === 0){
    return res.status(400).send('Empty')
  }
  users[userId] = {
    id: userId,
    email: useremail,
    password: hashpassword,
    urlsList :[]
  }
  req.session.user_id = '';
  // console.log(res.session.user_id)
  req.session.user_id = userId;
  // res.cookie('user_id', userId )
  res.redirect('/');
})

//
app.get('/urls', (req, res) => {
  console.log("loading GET /urls");
  let templateVars = {
    data : urlDatabase,
    urlArray : users[req.session.user_id]
  };
  if(req.session.user_id){
    res.status(200)
    res.render('urls_index', templateVars);
    res.render('partials/_header', templateVars);
    console.log('cookie available!!!')
  }else {
    res.status(401)
    res.send('<a href="/login">login</a>')
  }
});

//New url
app.get('/urls/new', (req, res) => {
  console.log("loading GET /urls/new");
  console.log('Cookie available for new: ',req.session.user_id);

  if(!req.session.user_id){
    res.status(401)
    res.send('<h2>Error! Please Login</h2><a href="/login">login</a>')
  } if(req.session.user_id) {
    let templateVars = {
      data : urlDatabase,
      urlArray : users[req.session.user_id]
    };
    res.status(200)
    res.render('urls_new', templateVars);
  }
});

//Make new url
app.post('/urls/new', (req, res) => {
  console.log("loading GET /urls/create");
  let longUrl = req.body.longURL
  shortUrl = generateRandomString()
  console.log('longUrl: ', longUrl, 'shortUrl:', shortUrl)
  if(longUrl.length < 3){
    console.log('Invalid URL')
    res.redirect('/urls/new');
  }

  amount += 1;
  users[req.session.user_id].urlsList.push(shortUrl)
  //console.log(users)
  urlDatabase[shortUrl] = longUrl
  // console.log(urlDatabase)
  console.log('-----------')
  res.redirect(`/urls/${shortUrl}`);
});

//login
app.get('/login', (req, res) => {
  if(res.locals.user){
    res.redirect('')
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
  // bcrypt.compareSync(userpassword, hashed_password);
  for(var item in users){
    if(users[item].email === useremail && bcrypt.compareSync(userpassword, users[item].password)){
      // console.log('Login Successful')
      // console.log('Check for hash',users)
      // // loggedIn = users[item]
      // console.log('users: ', users[item].id)
      // res.locals.user = users[item].id
      // res.locals.email = users[item].username
      // req.session.user_id
      req.session.user_id = users[item].id;
      req.session.username = users[item].email;
      console.log('users after login: ', req.session.user_id, users[item].id)
      return res.redirect('/');

    }
  }
  for(var item in users){
    if(users[item].email !== useremail && users[item].password !== userpassword){
      console.log('Wrong Username or password')
      return res.status(401).send('<h1>wrong username or password</h1>')
    }
  }
  // console.log(users)
  // res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session.user_id = ''; // set cookies username
  console.log('logout session user_id:  ', req.session.user_id.length)
  res.redirect('/');
});

app.get('/urls/:id', (req, res) => {
  console.log("loading GET /urls/:id");
  console.log('check or :ID: ', req.params.id)
  const user = users[req.session.user_id];
  // const userData = user.urlsList;

  // console.log('user.urlsList.includes(req.params.id)', user.urlsList.includes(req.params.id))
  // console.log('user.urlsList.', user.urlsList)
   console.log('users:', users)
  // console.log('users:', users[urlsList])
  // console.log(users[req.session.user_id].urlsList.includes(req.params.id))
  console.log('users[req.session.user_id]:', users)
  function scanUrl(x){
    for(var i in users){
      // console.log('EAch:', users[i].urlsList.includes(x))
      if(users[i].urlsList.includes(x)){
        return true
      }
    }
    return false
  }

  if(user){
    res.status(200)
    console.log('You have a User!')
    if(user.urlsList.includes(req.params.id)){
      console.log(users)
      // default case urls_show
      console.log('You have this in you database!')
      return res.redirect('/')
    } // scan arrays in database matching for matching urls
    else if(scanUrl(req.params.id)){
      res.status(403).send('<h2>it is in another database</h2>')
    }
    else{//User does not have this in database, its in another's
      res.status(404).send('Item does not exist in database')
    }
  }else {//Users not login
    res.status(401).send('<h2>Error! Please Login</h2><a href="/login">login</a>')
    console.log("Have NO User!")
  }
});

app.post('/urls/:id/delete', (req, res) => {

  // console.log("before delete");
  // console.log("URLs:", urlDatabase);
  // console.log("users:", users);
  // console.log("Id of ORGINAL user: =>", req.cookies.user_id, req.params.id)
  if(users[req.session.user_id].urlsList.includes(req.params.id)){
    let idDelete = req.params.id
    delete urlDatabase[idDelete]
  }

  // delete urlDatabase[idDelete]
  // console.log(users)
  let array = users[req.session.user_id].urlsList
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
  console.log(urlDatabase)
  res.redirect('/urls')
});

app.get('/u/:shortUrl', (req, res) => {
  console.log('this is the short redirect!', res)
  let longUrl = urlDatabase[req.params.shortUrl];

  // console.log(urlDatabase[req.params.shortUrl])
  res.redirect(longUrl);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
