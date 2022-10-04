import passport from 'passport';
import User from '../models/User.js';
import RegisterCode from '../models/Registration.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
//import { nanoid } from 'nanoid';




export async function getCreateAdmin(req, res){
  const errors = [];
  const adminAccount = await User.findOne({admin:true}); //verify if an admin account exists

  if(adminAccount){
    errors.push('Administrator account already exists');

    req.flash('errors', errors);
    res.redirect('/dashboard');
  }else {
    res.render('administrator', { user: req.user, messages: req.flash('errors') });
  }
};



export async function getReset(req, res){
  res.render('reset', { user: req.user, messages: req.flash('errors') });
};

export async function resetPassword(req, res){
  const errors = [];

  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(validator.isEmpty(req.body.password)) errors.push('password field cant be blank');
  if(!validator.isLength(req.body.password, {min: 0})) {
    errors.push({msg: 'password must be at least 8 chars long'});
  }
  if(req.body.password !== req.body.confirmPassword) {
    errors.push({msg: 'passwords do not match'});
  }

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('reset', { user: req.user, messages: req.flash('errors') });
  }

  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  //check email
  const userList = await User.find({email: req.body.email})
  const hashPass = await bcrypt.hash(req.body.password, 10);

  //change password
  if(userList){
    User.findOneAndUpdate({email: req.body.email}, {tempPassword: hashPass})
  }

  res.render('reset', { user: req.user, messages: req.flash('errors') });
};

export async function approvePassword(req, res){


  res.render('createUser', { user: req.user, messages: req.flash('errors') });
}




export async function getVerifyAccount(req, res){
  res.render('verifyAccount', { user: req.user, messages: req.flash('errors') });
};



export async function getLogin(req, res){
  res.render('login', { user: req.user, messages: req.flash('errors') });
};



export async function getUserAdmin(req, res){
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
};

//------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------


export async function loginUser(req, res, next){
  const errors = [];
   
  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(validator.isEmpty(req.body.password)) errors.push('password field cant be blank');

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('login', { user: req.user, messages: req.flash('errors') });
  }
  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  passport.authenticate('local', (err, user, info) => {
    if(err) return next(err);
    if(!user) {
      req.flash('errors', info.msg);
      console.log('errors2', info)
      return res.render('login', { user: req.user, messages: req.flash('errors') });
    }
    // if(!user.registered) {
    //   req.flash('errors', 'user is not registered');
      
    //   return res.render('login', { user: req.user, messages: req.flash('errors') });
    // }

    if(user.revoked) {
      req.flash('errors', 'user access was revoked');
      
      return res.render('login', { user: req.user, messages: req.flash('errors') });
    }

    req.logIn(user, (err) => {
      if(err) return next(err);
      res.redirect(req.session.returnTo || '/')
    })
  })(req, res, next)
}




export async function addUser(req, res, next){
  const errors = [];

  if(!validator.isEmail(req.body.email.trim())) {
    errors.push({msg: 'not a valid email'});
  }
  if(!validator.isLength(req.body.password, {min: 0})) {
    errors.push({msg: 'password must be at least 8 chars long'});
  }
  if(req.body.password !== req.body.confirmPassword) {
    errors.push({msg: 'passwords do not match'});
  }
  if(!req.session.admin && !req.user.admin) { //if we are not making an admin account then we need to be the administrator in order to make an account
    errors.push({msg: 'not an administrator account'});
  }

  if(errors.length) {
    req.flash('errors', errors);
    return req.session.admin ? res.render('administrator', { user: req.user, messages: req.flash('errors') }) : res.render('createUser', { user: req.user, messages: req.flash('errors') });
  }
  

  req.body.email = validator.normalizeEmail(req.body.email.trim(), {gmail_remove_dots: false});
  const hashPass = await bcrypt.hash(req.body.password, 10);

  const user = new User({
      email: req.body.email,
      password: hashPass,
  })

  const userCheck = [{
    email: req.body.email
  }]

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
      //user created successfully
      req.session.admin ? res.render('administrator', { user: req.user, messages: req.flash('errors') }) : res.render('createUser', { user: req.user, messages: req.flash('errors') });

      //createCode() // if you wish to implement a verification route for created user accounts then you can add it here. 
      // req.logIn(user, (err) => { //this is for logging the created account in which in this case we don't want to do.
      //   if (err) {
      //     return next(err)
      //   }
        //res.redirect('/auth/user')
      // })
    })
  })
}


export async function addAdmin(req, res, next){
  User.findOne({ admin: true }, (err, doc) => {
    if(err) return next(err);
    if(doc) {
      req.flash('errors', {msg: 'an admin account already exists'});
      return res.render('administrator', { user: req.user, messages: req.flash('errors') });
    }

    req.session.admin = true; //this indicates, through the session, that we are making an administrator account
    addUser(req, res, next);
  })
}



export function logout(req, res){
  req.logout(function(err){
    req.session.destroy((err) => {
      if (err) console.log('Error : Failed to destroy the session during logout.', err)
      req.user = null
      res.redirect('/')
    })
  })
}
