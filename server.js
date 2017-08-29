const express	= require('express')
const app		= express()
const port		= process.env.PORT || 8081
const mysql		= require('mysql')

const morgan		= require('morgan')
const bodyParser	= require('body-parser')
const session		= require('express-session')

const path		= require('path')

const conn	= mysql.createConnection({
	host		: "localhost",
	user		: "root",
	password	: "ilovebourbon",
	database 	: "cse135crud"
});

conn.connect(function(err) {
	if (err) throw err;
	console.log("Connected to MySQL database.");

	// var sql = "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255), name VARCHAR(255), password VARCHAR(255))";

	// conn.query(sql, function (err, result) {
	// 	if (err) throw err;
	// 	console.log("Table created");
	// })
})

// SETUP EXPRESS application
app.use(morgan('dev'))	// log every request to the console
app.use(bodyParser.urlencoded( { extended: true })) // get info from HTML forms
app.use(bodyParser.json())

// sets up ejs as view engine
app.set('view engine', 'ejs')

// setup session
app.use(session({
	secret: 'ilovebourbon',
	resave: true,
	saveUninitialized: true
}))

// APP ROUTES
const routes = require('./app/routes/routes')(app, express, conn);

app.listen(port)
console.log('The magic happens on port ' + port)