// server.js

// setting up & getting all the tools we need
var express  = require('express');
var app     = express();

//body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var port     = process.env.PORT || 4000;
var mysql = require('mysql');


//session mgmt
var session      = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser()); // read cookies (needed for auth)

app.use(session({
  secret: 'squishysquashygoo',
 resave: true,
  rolling: true,
  saveUninitialized: true,
   cookie: { 
  expires:15*60*1000
  }
 
}))
app.use(bodyParser()); // get information from html forms


//MYSQL DB CONFIG

var connection = mysql.createConnection({
  host     : 'lavymysql.cnywgp1kyedu.us-east-1.rds.amazonaws.com',
  port	   : '3306',
  user     : 'root',
  password : 'lavanyar',
  database : 'Project1_DB'
});


connection.connect(function(err){
if(!err) {
    console.log("Database is connected");    
} else {
    console.log("Error connecting database");    
}
});


// POST http://localhost:8080/api/users
// parameters sent with 

//login
app.post('/login', function(req,res) {
    var username = req.body.username;
    var password = req.body.password;
    var userid_sql = "SELECT * FROM users where username=? and password=?";
	if(!username || !password){
		res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
	}
	connection.query(userid_sql,[username,password],function(err,results){
	//console.log("result length"+ results.length);
		var rlength = results.length
				
		if(rlength <= 0){
		res.json({"message":"There seems to be an issue with the username/password combination that you entered"});
	}
		
		else if(!results){
		res.json({"message":"There seems to be an issue with the username/password combination that you entered"});  
		}		
	
	else{
		var firstname = results[0].fname;
		//console.log("fname"+fname)
		// gets username of the user to set cookie
		var sessionname = results[0].username;
		req.session.user = sessionname;  // sets a cookie with the user's info
		var msg = "Welcome " + firstname;
		res.json({"message":msg});    
	}
});
});

//add
app.post('/add', function(request, response){
	if(request.session && request.session.user){
	var num1 = parseInt(request.body.num1); 
	var num2 = parseInt(request.body.num2); 
	if(isNaN(num1) || isNaN(num2)){
		response.json({"message" : "The numbers you entered are not valid"});
	}  else{		
	var result = num1 + num2;
	response.json({"message" : "The action was successful","result"  : result});	
	}
	}
	else{
		response.json({"message":"You are not currently logged in"});	
	}
});

//divide
app.post('/divide', function(request, response){
	if(request.session && request.session.user){
	var num1 = parseInt(request.body.num1); 
	var num2 = parseInt(request.body.num2); 
	var result = num1 / num2;
	if(isNaN(num1) || isNaN(num2) || num2 == 0){
	response.json({"message" : "The numbers you entered are not valid"}); 
 }	else{
		response.json({"message" : "The action was successful","result"  : result});	
	}
	}
	else{
		response.json({"message":"You are not currently logged in"});	
	}
});

//multiply
app.post('/multiply', function(req, res){
	if(req.session && req.session.user){
	var num1 = parseInt(req.body.num1); 
	var num2 = parseInt(req.body.num2); 
	var result = num1 * num2;
	if(isNaN(num1) || isNaN(num2)){
	res.json({"message" : "The numbers you entered are not valid"}); 
 }	else{
		res.json({"message" : "The action was successful","result"  : result});	
	}
}
else{
		res.json({"message":"You are not currently logged in"});	
	}
		
});

//logout 
app.post('/logout', function(req, res) {
	    if (req.session && req.session.user) {
  req.session.destroy(function(){
  res.json({"message" : "You have been successfully logged out"});	})
  }
else{
	res.json({"message":"You are not currently logged in"});	
}
});

//launching 
app.listen(port);
console.log('Connection on port ' + port);