const express = require('express') 
const app = express()
//const connectDB = require('./config/database')

//routes path
const mainRoutes = require('./routes/mainRTE')


//const mongoose = require('mongoose') //mongoose handles the structure for our mongodb data. It will assure that the data in our database matches the definition we created for it.
//const passport = require('passport') // handle authentication (logins) for this application
//const session = require('express-session') // Keeps track of session data. Meaning data that you need to pass around your application.
//const MongoStore = require('connect-mongo') //saving session data in the db
//const flash = require('connect-flash'); //to display error messages

require('dotenv').config({path: '.env'}) //secrects file

// Passport config
//require('./config/passport')(passport)

//connectDB()

app.set('view engine', 'ejs') //what this app uses to code its view pages.
app.use(express.static('public')) //tells app to us the public folder to server up any files and images that we call. It sets the root directory for these as the folder name passed to it.
app.use(express.urlencoded({ extended: true })) //parses the information that is declared as x-www-form-urlencoded and makes it available for use
app.use(express.json()) //parses the information that is declared as json and makes it available for use



// app.use(
//     session({
//       secret: process.env.TheSECRECT, //this can be anything you want
//       resave: false, //keep a session active, only neccesary if the store does not support the touch command
//       saveUninitialized: false, //don't store the session if nothing changed
//       store: MongoStore.create({ //database for store session information
//         mongoUrl: process.env.DB_STRING
//       }),
//     })
//   )


// Flash middleware
//app.use(flash());


// app.use(function(req, res, next) {

//   // Read any flashed errors and save in the response locals
//   res.locals.error = req.flash('error_msg');

//   // Check for simple error string and convert to layout's expected format
//   let errs = req.flash('error');
//   for (let i in errs){
//     res.locals.error.push({message: 'An error occurred', debug: errs[i]});
//   }
//   next();
// });

//Passport middleware
//app.use(passport.initialize()) //setting up passport
//app.use(passport.session())

//declare routes to use
app.use('/', mainRoutes)

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on PORT: ${process.env.PORT} , you better catch it!`)
})    