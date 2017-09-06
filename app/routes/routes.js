// app/routes/routes.js

module.exports = function(app, express, conn, upload) {
  // HOME PAGE (with login links)
  app.get("/", function(req, res) {
    res.render("index.ejs"); // load the index.ejs file
  });

  // SIGNUP page
  app.get("/signup", function(req, res) {
    res.render("signup.ejs"); // load the signup.ejs file
  });

  app.post("/signup", function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email; //validate this...for now..
    var password = req.body.password;

    // Log user inputs
    console.log("First Name: " + firstName);
    console.log("Last Name: " + lastName);
    console.log("Email: " + email);
    console.log("Password: " + password);

    var addNewUserSQL =
      "INSERT INTO users (firstName, lastName, email, password) " +
      "VALUES ('" +
      firstName +
      "', '" +
      lastName +
      "', '" +
      email +
      "', '" +
      password +
      "')";

    //Check if email already exists...Server-Side
    const checkEmail = 'SELECT * FROM users WHERE email = "' + email + '" ';
    conn.query(checkEmail, function(err, result) {
      if (err) throw err;
      // If the result from the query is empty (bad email or password)
      if (result.length > 0) {
        console.log("Email already used.");
        res.render("signup.ejs");
      } else {
        // Log query string
        console.log(addNewUserSQL);
        // Execute query command
        conn.query(addNewUserSQL, function(err, result) {
          if (err) throw err;
          console.log("New user added.");
          console.log("Result return: " + result);
        });

        //HACK
        var uID;
        const getID = 'SELECT userid FROM users WHERE email = "' + email + '" ';
        conn.query(getID, function(err, result) {
          if (err) throw err;
          uID = result[0].userid;

          const inputLog =
            "INSERT into Logs (userid, attempts, fails, success, logouts) " +
            "VALUES ('" +
            parseInt(uID) +
            "', '" +
            "0" +
            "', '" +
            "0" +
            "', '" +
            "0" +
            "', '" +
            "0" +
            "')";
          conn.query(inputLog, function(err, result) {
            if (err) throw err;
            console.log("Added Log Data");
          });
        });

        res.redirect("/");
      }
    });
  });

  // LOG USER IN
  app.post("/login", function(req, res) {
    var email = req.body.email;
    var password = req.body.password;

    // Log user inputs
    console.log("Email: " + email);
    console.log("Password: " + password);

    var logUserSQL =
      'SELECT * FROM users WHERE email = "' +
      email +
      '" ' +
      '&& password = "' +
      password +
      '"';

    // Execute query call
    conn.query(logUserSQL, function(err, result) {
      if (err) throw err;
      // If the result from the query is empty (bad email or password)
      if (!result.length) {
        console.log("User not found or incorrect password.");

        //Get userid | attempts | fails | success | logouts
        const getLogs =
          "SELECT userid FROM users WHERE email=" + "'" + email + "'";
        conn.query(getLogs, function(err, result) {
          if (err) throw err;
          const uID = result[0].userid;
          const update =
            "UPDATE Logs SET attempts = attempts + 1, fails = fails + 1 WHERE userid = " +
            "'" +
            uID +
            "'";
          conn.query(update, function(err, result) {
            if (err) throw err;
            console.log("attempts updated.");
          });
        });

        res.render("index.ejs");
      } else {
        // User & password are correct & exist
        console.log("User found in database.");
        req.session.email = email;
        req.session.firstName = result[0].firstName;
        req.session.lastName = result[0].lastName;
        req.session.userid = result[0].userid;

        console.log("Email saved in session: " + req.session.email);
        console.log("First Name saved in session: " + req.session.firstName);
        console.log("Last Name saved in session: " + req.session.lastName);
        console.log("UserID saved in session: " + req.session.userid);
        const update =
          "UPDATE Logs SET attempts = attempts + 1, success = success + 1 WHERE userid = " +
          "'" +
          req.session.userid +
          "'";
        conn.query(update, function(err, result) {
          if (err) throw err;
          console.log("attempts updated.");
        });

        res.redirect("/app");
      }
    });
  });

  // DASHBOARD AREA
  var data = {};

  app.get("/app", function(req, res) {
    var getSBdataSQL =
      "SELECT * FROM soundboards " +
      "WHERE userid = " +
      req.session.userid +
      " OR public = 1;";

    console.log(getSBdataSQL);

    conn.query(getSBdataSQL, function(err, result) {
      if (err) throw err;

      data = JSON.stringify(result);
      console.log("Data: " + data);

      res.render("dashboard.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        data: result
      });
    });
  });

  // INDIVIDUAL SOUNDBOARD PAGE
  app.get("/app/:userid/soundboard/:sbid", function(req, res) {
    console.log(req.params);
    req.session.currsbid = req.params.sbid;

    var getSoundsSQL =
      "SELECT * FROM sounds " + "WHERE sbid = " + req.params.sbid;

    conn.query(getSoundsSQL, function(err, result) {
      if (err) throw err;

      res.render("soundboard.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        data: result
      });
    });
  });

  app.post("/app/upload", function(req, res) {
    upload(req, res, function(err) {
      if (err) return res.end("Error uploading file.");

      console.log(req.files[0].filename);
      console.log(req.files[1].filename);

      var addNewSoundSQL =
        "INSERT INTO sounds (sbid, name, image, sound) " +
        "VALUES (" +
        req.session.currsbid +
        ", '" +
        req.body.soundName +
        "', '/uploads/" +
        req.files[0].filename +
        "', '/uploads/" +
        req.files[1].filename +
        "')";

      console.log(addNewSoundSQL);

      conn.query(addNewSoundSQL, function(err, result) {
        if (err) throw err;

        res.redirect(
          "/app/" + req.session.userid + "/soundboard/" + req.session.currsbid
        );
      });
    });
  });

  app.post("/app/soundboard", function(req, res) {
  	upload(req, res, function(err) {
  		if (err) return res.end("Error uploading file.");

  		console.log(req.files[0].filename);

  		var addNewSbSQL = 
  			"INSERT INTO soundboards (userid, title, public, thumbnail) " +
  			"VALUES (" +
  			req.session.userid + ", \'" +
  			req.body.title + "\', " +
  			req.body.public + ", \'/uploads/" +
  			req.files[0].filename + "\')";

  		console.log(addNewSbSQL);

  		conn.query(addNewSbSQL, function(err, result) {
  			if (err) throw err;

  			res.redirect('/app');
  		})
  	})
  })
    //SORT: PUBLIC BOARDS
    app.get('/app/public', function (req, res) {

		var getSBpubdataSQL = "SELECT * FROM soundboards " +
			"WHERE public = 1;";

		console.log(getSBpubdataSQL);

		conn.query(getSBpubdataSQL, function (err, result) {
			if (err) throw err;

			data = JSON.stringify(result);
			console.log("Data: " + data);

			res.render('public.ejs', {
				email: req.session.email,
				firstName: req.session.firstName,
				lastName: req.session.lastName,
				userid: req.session.userid,
				data: result
			});	
		});
	})

    
    //SORT: PRIVATE BOARDS
    app.get('/app/private', function(req,res){
    		var getSBprivdataSQL = "SELECT * FROM soundboards " +
			"WHERE userid = " + req.session.userid + " AND public = 0;";

		console.log(getSBprivdataSQL);

		conn.query(getSBprivdataSQL, function (err, result) {
			if (err) throw err;

			data = JSON.stringify(result);
			console.log("Data: " + data);

			res.render('private.ejs', {
				email: req.session.email,
				firstName: req.session.firstName,
				lastName: req.session.lastName,
				userid: req.session.userid,
				data: result
			});	
		});
	})

    
    //SORT: LIST VIEW
    app.get('/app/list', function(req,res){
      var getSBdataSQL = "SELECT * FROM soundboards " +
			"WHERE userid = " + req.session.userid + " OR public = 1;";

		console.log(getSBdataSQL);

		conn.query(getSBdataSQL, function (err, result) {
			if (err) throw err;

			data = JSON.stringify(result);
			console.log("Data: " + data);

			res.render('list.ejs', {
				email: req.session.email,
				firstName: req.session.firstName,
				lastName: req.session.lastName,
				userid: req.session.userid,
				data: result
			});	
		});
	})
  
    //SORT: ALPHABETICAL
     app.get('/app/alphabetical', function(req,res){
    	var getSBalphaSQL = "SELECT * FROM soundboards " +
			"WHERE userid = " + req.session.userid + " OR public = 1 ORDER BY title;";

		console.log(getSBalphaSQL);

		conn.query(getSBalphaSQL, function (err, result) {
			if (err) throw err;

			data = JSON.stringify(result);
			console.log("Data: " + data);

			res.render('alphabetical.ejs', {
				email: req.session.email,
				firstName: req.session.firstName,
				lastName: req.session.lastName,
				userid: req.session.userid,
				data: result
			});	
		});
	})


  // LOG OUT OF SESSION
  app.get("/logout", function(req, res) {
    const update =
      "UPDATE Logs SET logouts = logouts + 1 WHERE userid = " +
      "'" +
      req.session.userid +
      "'";
    conn.query(update, function(err, result) {
      if (err) throw err;
      console.log("attempts updated.");
    });

    req.session.destroy();
    console.log("Session logout");
    res.redirect("/");
  });
};
