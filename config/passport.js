import localStrategy from 'passport-local';
import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export default function (passport) {
  passport.use(
    new localStrategy({
      usernameField: 'email' //set up usernameField to be email field in inputs
    }, async (email, password, done) => {
      User.findOne({email: email.toLowerCase()}, async (err, user) => { //using mongoose we are verifing is the email is already in our database.
        if(err) {return done(err);} //return callback with error only
        if(!user) {
          return done(null, false, {msg: 'user does not exist'});
          //return callback with null error, !user, and error message
        }
        try {
          if(await bcrypt.compare(password, user.password)) { //check is the passwords match
            return done(null, user);
          }
          else {
            return done(null, false, {msg: 'invalid password'})
          }
        } catch(e) {
          return done(e);
        }
      })
    }))
    passport.serializeUser((user, done) => {
     done(null, user._id)
   })
 
   passport.deserializeUser((id, done) => {
     User.findById(id, (err, user) => done(err, user)).select("email registered revoked admin")
   })
  }




