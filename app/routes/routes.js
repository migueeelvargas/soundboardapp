// app/routes/routes.js
module.exports = function (app, express, conn) {

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
		var name = req.body.name;
		var email = req.body.email;
		var password = req.body.password;

		// Log user inputs
		console.log("Name: " + name);
		console.log("Email: " + email);
		console.log("Password: " + password);

		var addNewUserSQL = 
			"INSERT INTO users (name, email, password) VALUES (\'" +
			name + "\', \'" + email + "\', \'" + password + "\')";

		// Log query string
		console.log(addNewUserSQL);

		// Execute query command
		conn.query(addNewUserSQL, function(err, result) {
			if (err) throw err;
			console.log("New user added.")
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
				req.session.name = result[0].name;
				console.log("Email saved in session: " + req.session.email);
				console.log("Name saved in session: " + req.session.name);

				res.redirect('/app');
			}
		})
	})

	// DASHBOARD AREA
	app.get('/app', function (req, res) {
		res.render('dashboard.ejs', {
			email: req.session.email,
			name: req.session.name
		});
	})

	// LOG OUT OF SESSION
	app.post('/logout', function(req, res) {
		req.session.destroy();
		res.redirect('/');
	})

}
