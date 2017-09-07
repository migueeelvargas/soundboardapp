# Soundboard App

## Polish

Improvements from the HW3:

1. Added support for admin user, who has ability to view all user emails on the soundboard.
   The ability to delete the particular user, and Also edit all but the email of the particular
   user. Admin has ability to view all sounds/soundboards. Username: admin@ucsd.edu, Password: 12345678 
2. Added support for the deletion of both soundboards and the individual sounds associated with 
   them. 
3. Modified UI to be more welcoming. 
4. Split up application structure; following tradition MVC patter. 
5. We added more validation/sanitation to both login/signup using express-validator. 
6. Added protectin against closing the window and the session staying..

## To set up the app in your local environment

1. Download all dependencies: `npm install`
2. Start the node server: `node server.js`
3. On your browser go to: `localhost:8080`

## To use on our public facing server

1. First go to the sign up page and create an account.
   Once created/submitted, the application will reroute
   you to the login page.
2. Enter the Email/Password combo you filled out on the
   signup page. On a successful login, you will be rerouted
   to the personalized dashboard for your account. On a
   failed login, the screen will display what went wrong. 
3. On the main dashboard page, you will be presented
   with all the public soundboards. Clicking on the image
   of the soundboard will reroute you to that particular
   soundboards page; where you can listen to all of the
   sounds. You will also be able to add sounds + images
   for the soundboard.

4. Going back to the main dashboard page, you are also
   able to add a new soundboard, which can either be public
   or private. You may also add an image thumbnail.


## Core Technology 

Our application uses Node.js and the Express.js framework as well as 
Embeded Javascript Templates. Our database technology is MySQL, which is hosted
on its own server. 

To have command-line access to the DB, Open thy terminal and type the following: 

mysql -u yfa1b5xr3062ctem -h ipobfcpvprjpmdo9.cbetxkdyhwsb.us-east-1.rds.amazonaws.com apz88ekivr2vs5ov -p

Password: enpavzdbydherk36


## Thoughts on Technology

The node.js runtime environment in its own right can be overwhelming and quite complex to work with. Fortunately, 
the Express.js framework is barebones enough for us to understand documentation and its general flow quite fast. 
A difficult aspect of Express.js is its notion of non-structure; where the developer is given complete control 
of the application composition. Following a general mvc pattern helped us organize the application. The MySQL 
database was easy to integrate into our application and also easy to work with. Embeded Javascript template 
system is also quite intuitive and easy to use; and integrates fantastically with Express.js. The module 
express-validator was also quite useful. 


## Application Tech:

As per package.json we are relying on a varied amount of
npm packages such as the following:
- "bcrypt-nodejs": "0.0.3",
- "body-parser": "^1.17.2",
- "connect-flash": "^0.1.1",
- "cookie-parser": "^1.4.3",
- "ejs": "^2.5.7",
- "express": "^4.15.4",
- "express-session": "^1.15.5",
- "method-override": "^2.3.9",
- "mime-types": "^2.1.17",
- "morgan": "^1.8.2",
- "multer": "^1.3.0",
- "mysql": "^2.14.1"
- "express-validator": "4.1.1"


- mysql ~ Database Software.
- multer ~ Middleware for handling multipart/form-data, which is primarily
used for uploading files.
- ejs ~ Templating.
- express ~ Web Framework to speed up development.
- morgan ~ HTTP request logger middleware for node.js
- bcrypt-nodejs ~ Crypto libraries.
- body-parser ~ Parse incoming request bodies in a middleware.
- connect-flash ~ Sessioning.
- cookie-parser ~ In the name.
- express-session ~ Sessioning.
- mime-types ~ content-type utility.
- express-validator ~ help with input validation.













    Performance - by making our executions faster for our end users
    Security - by locking down our app in preparation for the hack contest
    Polish - addressing things undone or done poorly in HW3 and adding docs and polish for the final launch
