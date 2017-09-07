// app/routes/routes.js

module.exports = function(app, express, conn, upload) {
  // HOME PAGE (with login links)
  app.get("/", function(req, res) {
    res.render("index.ejs", {
      error: 0
    }); // load the index.ejs file
  });

  app.get("/error", function(req, res) {
    res.render("index.ejs", {
      error: 1
    }); // load the index.ejs file
  });

  //--------------------------------------------------------------------

  // NOTE: Uses users3 DB

  app.get("/admin", function(req, res, next) {
    if (req.session.admin == 1) {
      var getSBdataSQL =
        "SELECT * FROM soundboards " +
        "WHERE userid = " +
        req.session.userid +
        " OR public = 0" +
        " OR public = 1";

      var getUsers =
        "SELECT userid, email, firstName, lastName FROM users3 WHERE admin='0'";

      //console.log(getSBdataSQL);
      conn.query(getSBdataSQL, function(err, result) {
        if (err) return next(err);

        //Soundboard data.
        conn.query(getUsers, function(err, result2) {
          users = JSON.stringify(result2);
          console.log("Data: " + users);

          res.render("admin.ejs", {
            email: req.session.email,
            firstName: req.session.firstName,
            lastName: req.session.lastName,
            userid: req.session.userid,
            data: result,
            users: result2
          });
        });
      });
    }
    //TODO: Have else case here.
  });

  app.post("/adminDel", function(req, res) {
    var em = req.body.email;
    console.log("DELETE " + em);

    delQuery =
      "DELETE FROM users3 WHERE email=" +
      "'" +
      req.body.email +
      "'" +
      " AND admin='0'";
    conn.query(delQuery, function(err, result) {
      if (err) throw err;
      if (!result.length) {
        console.log("User not found or incorrect password.");
      }
    });
    res.redirect("/admin");
  });

  app.post("/adminAdd", function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email; //validate this...for now..
    var password = req.body.password;

    var addNewUserSQL =
      "INSERT INTO users3 (firstName, lastName, email, password, admin) VALUES ('" +
      firstName +
      "', '" +
      lastName +
      "', '" +
      email +
      "', '" +
      password +
      "', '" +
      "0" +
      "')";

    conn.query(addNewUserSQL, function(err, result) {
      if (err) throw err;
      console.log("New user added.");
      console.log("Result return: " + result);
    });

    res.redirect("/admin");
  });

  app.post("/adminEdit", function(req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email; //validate this...for now..
    var password = req.body.password;

    updateQ =
      "UPDATE users3 SET firstName = " +
      "'" +
      firstName +
      "', " +
      "lastName = " +
      "'" +
      lastName +
      "', " +
      "password = " +
      "'" +
      password +
      "'" +
      " WHERE email = " +
      "'" +
      email +
      "'";

    conn.query(updateQ, function(err, result) {
      if (err) throw err;
    });
    res.redirect("/admin");
  });

  //--------------------------------------------------------------------
  // SIGNUP page
  app.get("/signup", function(req, res) {
    res.render("signup.ejs"); // load the signup.ejs file
  });

  app.post("/signup", function(req, res) {
    // Validation of input...
    req.checkBody("email", "Enter a valid email address").isEmail().isLength({min: 5, max: 20});
    req
      .checkBody(
        "firstName",
        "First name can only include english language letters"
      )
      .isLength({ min: 2, max: 15 })
      .isAlpha();
    req
      .checkBody(
        "lastName",
        "Last name can only include english language letters"
      )
      .isLength({ min: 2, max: 15 })
      .isAlpha();
    req
      .checkBody(
        "password",
        "Password must be minimum 8 char long, and alphanumeric..."
      )
      .isLength({ min: 8, max: 13 })
      .isAlphanumeric();

    req.sanitize("firstName").escape();
    req.sanitize("firstName").trim();

    req.sanitize("lastName").escape();
    req.sanitize("lastName").trim();

    req.sanitize("password").escape();
    req.sanitize("password").trim();

    var errors = req.validationErrors();
    if (errors) {
      //Custom error??
      res.send(errors);
      return;
    } else {
      var firstName = req.body.firstName;
      var lastName = req.body.lastName;
      var email = req.body.email; //validate this...for now..
      var password = req.body.password;

      var addNewUserSQL =
        "INSERT INTO users3 (firstName, lastName, email, password, admin) " +
        "VALUES ('" +
        firstName +
        "', '" +
        lastName +
        "', '" +
        email +
        "', '" +
        password +
        "', '" +
        "0" +
        "')";

      //Check if email already exists...Server-Side
      const checkEmail = 'SELECT * FROM users3 WHERE email = "' + email + '" ';
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
          const getID =
            'SELECT userid FROM users3 WHERE email = "' + email + '" ';
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
    }
  });

  //--------------------------------------------------------------------

  // NOTE: Uses users3 DB

  //NOTE: Changed with new DB
  app.post("/login", function(req, res) {
    req.checkBody("email", "Invalid Email Input").isEmail().isLength({min: 5, max: 20});
    req
      .checkBody("password", "Invalid Password Composition")
      .isLength({ min: 8, max: 13 });

    req.sanitize("password").escape();
    req.sanitize("password").trim();

    req.sanitize("email").escape();
    req.sanitize("email").escape();
    var errors = req.validationErrors();
    if (errors) {
      //Custom error??
      res.send(errors);
      return;
    } else {
      // //Sanitize...
      var email = req.body.email;
      var password = req.body.password;

      // Log user inputs
      console.log("Email: " + email);
      console.log("Password: " + password);

      var logUserSQL =
        'SELECT * FROM users3 WHERE email = "' +
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

          // Check if email of user exists in DB, for Logging...
          const getLogs =
            "SELECT userid FROM users3 WHERE email=" + "'" + email + "'";
          conn.query(getLogs, function(err, result2) {
            if (err) throw err;
            if (result2.length > 0) {
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
            }
          });

          res.render("index.ejs");
        } else {
          //TODO: ELIF here that would redirect
          // User & password are correct & exist
          console.log("User found in database.");
          req.session.email = email;
          req.session.firstName = result[0].firstName;
          req.session.lastName = result[0].lastName;
          req.session.userid = result[0].userid;
          req.session.admin = result[0].admin;

          const update =
            "UPDATE Logs SET attempts = attempts + 1, success = success + 1 WHERE userid = " +
            "'" +
            req.session.userid +
            "'";

          conn.query(update, function(err, result) {
            if (err) throw err;
            console.log("attempts updated.");
          });

          if (result[0].admin == 1) {
            res.redirect("/admin");
          } else {
            res.redirect("/app");
          }
        }
      });
    }
  });

  //--------------------------------------------------------------------

  // DASHBOARD AREA
  var data = {};

  app.get("/app", function(req, res, next) {
    var getSBdataSQL =
      "SELECT * FROM soundboards " +
      "WHERE userid = " +
      req.session.userid +
      " OR public = 1;";

    console.log(getSBdataSQL);

    conn.query(getSBdataSQL, function(err, result) {
      if (err) return next(err);

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

    var getSbNameSQL = 
      "SELECT title FROM soundboards WHERE sbid =" + req.params.sbid;

    var sbTitle;

    conn.query(getSbNameSQL, function (err, result) {
      if (err) throw err;
      // Assign title
      sbTitle = result[0].title;
    })

    var getSoundsSQL =
      "SELECT * FROM sounds " + "WHERE sbid = " + req.params.sbid;

    conn.query(getSoundsSQL, function(err, result) {
      if (err) throw err;

      res.render("soundboard.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        title: sbTitle,
        sbid: req.params.sbid,
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
        req.session.userid +
        ", '" +
        req.body.title +
        "', " +
        req.body.public +
        ", '/uploads/" +
        req.files[0].filename +
        "')";

      console.log(addNewSbSQL);

      conn.query(addNewSbSQL, function(err, result) {
        if (err) throw err;

        res.redirect("/app");
      });
    });
  });
  //SORT: PUBLIC BOARDS
  app.get("/app/public", function(req, res, next) {
    var getSBpubdataSQL = "SELECT * FROM soundboards " + "WHERE public = 1;";

    console.log(getSBpubdataSQL);

    conn.query(getSBpubdataSQL, function(err, result) {
      if (err) return next(err);

      data = JSON.stringify(result);
      console.log("Data: " + data);

      res.render("public.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        data: result
      });
    });
  });

  //SORT: PRIVATE BOARDS
  app.get("/app/private", function(req, res, next) {
    var getSBprivdataSQL =
      "SELECT * FROM soundboards " +
      "WHERE userid = " +
      req.session.userid +
      " AND public = 0;";

    console.log(getSBprivdataSQL);

    conn.query(getSBprivdataSQL, function(err, result) {
      if (err) return next(err);

      data = JSON.stringify(result);
      console.log("Data: " + data);

      res.render("private.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        data: result
      });
    });
  });

  //SORT: LIST VIEW
  app.get("/app/list", function(req, res, next) {
    var getSBdataSQL =
      "SELECT * FROM soundboards " +
      "WHERE userid = " +
      req.session.userid +
      " OR public = 1;";

    console.log(getSBdataSQL);

    conn.query(getSBdataSQL, function(err, result) {
      if (err) return next(err);

      data = JSON.stringify(result);
      console.log("Data: " + data);

      res.render("list.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        data: result
      });
    });
  });

  //SORT: ALPHABETICAL
  app.get("/app/alphabetical", function(req, res, next) {
    var getSBalphaSQL =
      "SELECT * FROM soundboards " +
      "WHERE userid = " +
      req.session.userid +
      " OR public = 1 ORDER BY title;";

    console.log(getSBalphaSQL);

    conn.query(getSBalphaSQL, function(err, result) {
      if (err) return next(err);

      data = JSON.stringify(result);
      console.log("Data: " + data);

      res.render("alphabetical.ejs", {
        email: req.session.email,
        firstName: req.session.firstName,
        lastName: req.session.lastName,
        userid: req.session.userid,
        data: result
      });
    });

    data = JSON.stringify(result);
    console.log("Data: " + data);

    res.render("alphabetical.ejs", {
      email: req.session.email,
      firstName: req.session.firstName,
      lastName: req.session.lastName,
      userid: req.session.userid,
      data: result
    });
  });

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

  //   TjODO: Work on input validation.
  // app.get("*", function(req, res, next) {
  //   var err = new Error();
  //   err.status = 404;
  //   return next(err);
  // });

  // app.use(function(err, req, res, next) {
  //   res.redirect("/error");
  //   res.status("404");
  //   res.send("error!");
  // });

  // DELETE STUFF
app.delete('/app/soundboard/:sbid', function (req, res) {

    var deleteSoundsSQL =
        "DELETE FROM sounds WHERE sbid = " + req.params.sbid;

    
    console.log("DELETE requested: " + deleteSoundsSQL);

    conn.query(deleteSoundsSQL, function (err, result) {
      if (err) throw err;

        var deleteSbSQL = 
          "DELETE FROM soundboards WHERE sbid = " + req.params.sbid;
          
        conn.query(deleteSbSQL, function (err, result) {
          if (err) throw err;

          console.log("Soundboard deleted!");
        })

      req.method = 'GET';

      res.redirect(303,'/app');
    })
  })

  app.delete('/app/sound/:soundid', function (req, res) {

    var deleteSoundSQL = "DELETE FROM sounds WHERE soundid = " + req.params.soundid;

    conn.query(deleteSoundSQL, function (err, result) {
      if(err) throw err;

      console.log("Sound deleted!")

      res.send('/app/' + req.session.userid + '/soundboard/' + req.session.currsbid);
    })
  })

  app.put('/app/sound/:soundid', function (req, res) {

    var updateSQL = "UPDATE sounds SET name = \'" + 
      req.body.name + "\' WHERE soundid = " + req.params.soundid;

    conn.query(updateSQL, function (err, result) {
      if(err) throw err;

      console.log("Sound updated!");

      res.send('/app/' + req.session.userid + '/soundboard/' + req.session.currsbid);
    })
  })
};


