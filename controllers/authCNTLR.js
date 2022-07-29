const passport = require('passport');
const User = require('../models/User');
const validator = require('validator');
const bcrypt = require('bcrypt');

module.exports = {
  getPage: async (req, res) => {
    res.render('login', {user: req.user, messages: 'none'});
  },

  getAdmin: async (req, res) => {
    const errors = [];
    const adminAccount = await User.findOne({admin:true})

    if(adminAccount){
      console.log(adminAccount)
      errors.push('Administrator account already exists');
      req.flash('errors', errors);

      res.render('dashboard', { user: req.user, messages: req.flash('errors') });
    }else {
      res.render('administrator', { user: req.user, messages: req.flash('errors') });
    }
  },

  getLogin: async (req, res) => {
    res.render('login', { user: req.user, messages: req.flash('errors') });
  },

  getUserAdmin: async (req, res) => {
    const errors = [];

    if(req.user.admin){
      const userList = await User.find({}).select("email registered revoked");

      res.render('createUser', { 
        user: req.user,
        userList,
        messages: req.flash('errors') 
      });
    } else {
      errors.push('Not an administrator account');
      req.flash('errors', errors);

      res.render('dashboard', { user: req.user, messages: req.flash('errors') });
    }
  },

  loginUser: async (req, res, next) => {
    const errors = [];
    if(!validator.isEmail(req.body.email)) errors.push('email is invalid');
    if(validator.isEmpty(req.body.password)) errors.push('password field cant be blank');

    if(errors.length) {
      req.flash('errors', errors);
      return res.render('login', { user: req.user, messages: req.flash('errors') });
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    passport.authenticate('local', (err, user, info) => {
      if(err) return next(err);
      if(!user) {
        req.flash('errors', info);
        //console.log('errors2', info)
        return res.render('login', { user: req.user, messages: req.flash('errors') });
      }
      req.logIn(user, (err) => {
        if(err) return next(err);
        res.redirect(req.session.returnTo || '/')
      })
    })(req, res, next)
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
    
//--------------------------------------------------------------------------------
    if(!req.session.admin && !req.user.admin) {
      errors.push({msg: 'not an administrator account'});
    }
//--------------------------------------------------------------------------------

    if(errors.length) {
      req.flash('errors', errors);
      return req.session.admin ? res.render('administrator', { user: req.user, messages: req.flash('errors') }) : res.render('createUser', { user: req.user, messages: req.flash('errors') });
    }
    

    req.body.email = validator.normalizeEmail(req.body.email, {gmail_remove_dots: false});
    const hashPass = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email: req.body.email,
      password: hashPass,
      }
    )

    const userCheck = [
      {email: req.body.email}
    ]

    if(req.session.admin){
      user.admin = req.session.admin
      userCheck.push({admin:req.session.admin})
    }

    req.session.admin = '';

    User.findOne({$or: 
      userCheck
    }, (err, doc) => {
      if(err) return next(err);
      if(doc) {
        req.flash('errors', {msg: 'an account with that email/username already exists'});
        return req.session.admin ? res.render('administrator', { user: req.user, messages: req.flash('errors') }) : res.render('createUser', { user: req.user, messages: req.flash('errors') });
      }
      user.save((err) => {
        if (err) { return next(err) }
        req.logIn(user, (err) => {
          if (err) {
            return next(err)
          }
          res.redirect('/auth/user')
        })
      })
    })
  },

  addAdmin: async (req, res, next) => {
    const errors = [];

    User.findOne({ admin: true }, (err, doc) => {
      if(err) return next(err);
      if(doc) {
        req.flash('errors', {msg: 'an admin account already exists'});
        return res.render('administrator', { user: req.user, messages: req.flash('errors') });
      }

      req.session.admin = true;
      module.exports.addUser(req, res, next)
    })
  },

  logout:(req, res) => {
    req.logout(function(err){
      req.session.destroy((err) => {
        if (err) console.log('Error : Failed to destroy the session during logout.', err)
        req.user = null
        res.redirect('/')
      })
    })
  }
}