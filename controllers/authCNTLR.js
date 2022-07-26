const passport = require('passport');
const User = require('../models/User');
const validator = require('validator');
const bcrypt = require('bcrypt');

module.exports = {
  getPage: async (req, res) => {
    res.render('login', {msg: 'none'});
  },

  addUser: async (req, res, next) => {
    const errors = [];

    if(!validator.isEmail(req.body.email)) {
      errors.push({msg: 'not a valid email'});
    }
    if(!validator.isLength(req.body.password, {min: 0})) {
      errors.push({msg: 'password must be at least 8 chars long'});
    }
    if(req.body.password !== req.body.confirmPassword) {
      errors.push({msg: 'passwords do not match'});
    }
    if(errors.length) {
      req.flash('errors', errors);
      return res.render('administrator', { messages: req.flash('errors') });
    }
    req.body.email = validator.normalizeEmail(req.body.email, {gmail_remove_dots: false});
    const hashPass = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      //username: req.body.username,
      email: req.body.email,
      password: hashPass,
      admin: req.session.admin ? true : false,
      }
    )
    //NOTE FIX THIS CHECK
    let adminCheck = req.session.admin ? true : false
    req.session.admin = '';

    User.findOne({$or: [
      adminCheck ? {admin: true} : '',
      {email: req.body.email}
    ]}, (err, doc) => {
      if(err) return next(err);
      if(doc) {
        req.flash('errors', {msg: 'an account with that email/username already exists'});
        return res.render('administrator', { messages: req.flash('errors') });
      }
      user.save((err) => {
        if (err) { return next(err) }
        req.logIn(user, (err) => {
          if (err) {
            return next(err)
          }
          res.redirect('/func')
        })
      })
    })
  },

  addAdmin: async (req, res, next) => {
    const errors = [];
    User.findOne({$or: [
      {admin: true},
      //{email: req.body.email}
    ]}, (err, doc) => {
      if(err) return next(err);
      if(doc) {
        req.flash('errors', {msg: 'an admin account already exists'});
        return res.render('administrator', { messages: req.flash('errors') });
      }
      req.session.admin = true;
      module.exports.addUser(req, res, next)
    })
  },

  logout:(req, res) => {
    req.logout()
    req.session.destroy((err) => {
      if (err) console.log('Error : Failed to destroy the session during logout.', err)
      req.user = null
      res.redirect('/')
    })
  }
}