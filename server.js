const express	= require('express')
const app		= express()
const port		= process.env.PORT || 8081
const mysql		= require('mysql')

const morgan		= require('morgan')
const bodyParser	= require('body-parser')
const session		= require('express-session')

const path		= require('path')

// MySQL db config
const conn	= mysql.createConnection({
	host		: "ipobfcpvprjpmdo9.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
	port 		: "3306",
	user		: "yfa1b5xr3062ctem",
	password	: "enpavzdbydherk36",
	database 	: "apz88ekivr2vs5ov"
});

// Connect to MySQL database
conn.connect(function(err) {
	if (err) throw err;
	console.log("Connected to MySQL database.");
})

// SETUP EXPRESS application
app.use(morgan('dev'))	// log every request to the console
app.use(bodyParser.urlencoded( { extended: true })) // get info from HTML forms
app.use(bodyParser.json())

// sets up ejs as view engine
app.set('view engine', 'ejs')

// path to all public file (CSS, JS, imgs, etc.)
app.use(express.static(__dirname + '/public'))

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