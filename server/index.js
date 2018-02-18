const express = require('express')
const path=require('path')
const axios = require('axios');
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const sprintInfo=require("./sprintinfo");

const app = express()
app.set('views', __dirname + '/views')
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  //var formData=req.body;
  var formData={
    username:"enter user name",
    password:"enter password"
  };
  var authKey=new Buffer(`${formData.username}:${formData.password}`).toString('base64');
  var boardIds=[17];  
  var allWorklogData=await sprintInfo.getWorklogsForAllBoards(formData.username,authKey); 
  var allData={
    Values:allWorklogData
  };
  return res.render('worklog',allData);
});

app.get('/j', (req, res) => { 
  return res.render('index');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))