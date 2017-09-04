// app/routes/routes.js
module.exports = function (app, express, conn, upload) {

	// HOME PAGE (with login links)
	app.get('/', function (req, res) {
		res.render('index.ejs')	// load the index.ejs file
	})

	// SIGNUP page
	app.get('/signup', function (req, res) {		
		res.render('signup.ejs')	// load the signup.ejs file
	})

	// CREATE NEW USER
	app.post('/signup', function (req, res) {
		var firstName = req.body.firstName;
		var lastName = req.body.lastName;
		var email = req.body.email;
		var password = req.body.password;

		// Log user inputs
		console.log("First Name: " + firstName);
		console.log("Last Name: " + lastName);
		console.log("Email: " + email);
		console.log("Password: " + password);

		var addNewUserSQL = 
			"INSERT INTO users (firstName, lastName, email, password) " +
			"VALUES (\'" + firstName + "\', \'" + lastName + "\', \'" + 
			email + "\', \'" + password + "\')";

		// Log query string
		console.log(addNewUserSQL);

		var newUserID;

		// Execute query command
		conn.query(addNewUserSQL, function(err, result) {
			if (err) throw err;
			console.log("New user added.");
			console.log("Result return: " + result);
		})

		res.render('index.ejs');
	})

	// LOG USER IN
	app.post('/login', function (req, res) {
		var email = req.body.email;
		var password = req.body.password;

		// Log user inputs
		console.log("Email: " + email);
		console.log("Password: " + password);

		var logUserSQL = 
			"SELECT * FROM users WHERE email = \"" + email + "\" "
			+ "&& password = \"" + password + "\"";

		// Log query string
		console.log(logUserSQL);

		// Execute query call
		conn.query(logUserSQL, function(err, result) {
			if (err) throw err;
			// If the result from the query is empty (bad email or password)
			if (!result.length) {
				console.log("User not found or incorrect password.");
				res.redirect('/');
			}
			// User & password are correct & exist
			else {
				console.log("User found in database.");
				req.session.email = email;
				req.session.firstName = result[0].firstName;
				req.session.lastName = result[0].lastName;
				req.session.userid = result[0].userid;

				console.log("Email saved in session: " + req.session.email);
				console.log("First Name saved in session: " + req.session.firstName);
				console.log("Last Name saved in session: " + req.session.lastName);
				console.log("UserID saved in session: " + req.session.userid);

				res.redirect('/app');
			}
		})
	})

	// DASHBOARD AREA
	var data = {};

	app.get('/app', function (req, res) {

		var getSBdataSQL = "SELECT * FROM soundboards " +
			"WHERE userid = " + req.session.userid;

		console.log(getSBdataSQL);

		conn.query(getSBdataSQL, function (err, result) {
			if (err) throw err;

			data = JSON.stringify(result);
			console.log("Data: " + data);

			res.render('dashboard.ejs', {
				email: req.session.email,
				firstName: req.session.firstName,
				lastName: req.session.lastName,
				userid: req.session.userid,
				data: result
			});	
		});
	})

	// INDIVIDUAL SOUNDBOARD PAGE
	app.get('/app/:userid/soundboard/:sbid', function (req, res) {
		console.log(req.params);
		req.session.currsbid = req.params.sbid;

		var getSoundsSQL = "SELECT * FROM sounds " + 
		"WHERE sbid = " + req.params.sbid

		conn.query(getSoundsSQL, function (err, result) {
			if (err) throw err;

			res.render('soundboard.ejs', {
				email: req.session.email,
				firstName: req.session.firstName,
				lastName: req.session.lastName,
				userid: req.session.userid,
				data: result
			});
		});
	})

	app.post('/app/upload', function(req, res){
		upload(req, res, function(err) {
			if (err)
				return res.end("Error uploading file.");

			console.log(req.files[0].filename);
			console.log(req.files[1].filename);

			var addNewSoundSQL = 
			"INSERT INTO sounds (sbid, name, image, sound) " +
			"VALUES (" + req.session.currsbid + ", \'" 
				+ req.body.soundName + "\', \'/uploads/" 
				+ req.files[0].filename + "\', \'/uploads/" 
				+ req.files[1].filename + "\')";

			console.log(addNewSoundSQL);

			conn.query(addNewSoundSQL, function (err, result) {
				if (err) throw err;

				res.redirect('/app/' + req.session.userid + '/soundboard/' + req.session.currsbid);
			});
		});
	})

	// LOG OUT OF SESSION
	app.get('/logout', function(req, res) {
		req.session.destroy();
		console.log("Session logout");
		res.redirect('/');
	})

}
