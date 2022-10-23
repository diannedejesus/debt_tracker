import passport from 'passport';
import User from '../models/User.js';
// import RegisterCode from '../models/Registration.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';




export async function getCreateAdmin(req, res){
  const errors = [];
  const adminAccount = await User.findOne({admin:true}); //verify if an admin account exists

  if(adminAccount){
    errors.push('Administrator account already exists');

    req.flash('errors', errors);
    res.redirect('/');
  }else {
    res.render('administrator', { user: req.user, messages: req.flash('errors') });
  }
};

export async function getReset(req, res){
  res.render('reset', { user: req.user, messages: req.flash('errors') });
};

export async function getVerifyAccount(req, res){
  res.render('verifyaccount', { user: req.user, messages: req.flash('errors') });
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
  
  //validate info
  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(validator.isEmpty(req.body.password)) errors.push('password field cant be blank');

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('login', { user: req.user, messages: req.flash('errors') });
  }

  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  //process authentication
  passport.authenticate('local', (err, user, info) => {
    if(err) return next(err);

    if(!user) {
      req.flash('errors', 'User does not exist, check spelling or contact administrator');
      console.log('errors2', info)
      return res.render('login', { user: req.user, messages: req.flash('errors') });
    }

    // if(!user.registered) {
    //   req.flash('errors', 'user is not registered');
      
    //   return res.render('login', { user: req.user, messages: req.flash('errors') });
    // }

    if(user.revoked) {
      req.flash('errors', 'user access was revoked, contact administrator');
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
  const authenticateCode = nanoid(10);

  //validate submitted info
  if(!validator.isEmail(req.body.email.trim())) {
    errors.push('not a valid email');
  }
  // if(!validator.isLength(req.body.password, {min: 0})) {
  //   errors.push({msg: 'password must be at least 8 chars long'});
  // }
  // if(req.body.password !== req.body.confirmPassword) {
  //   errors.push({msg: 'passwords do not match'});
  // }
  if(!req.user.admin) {
    errors.push('not an administrator account');
  }

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('createUser', { user: req.user, messages: req.flash('errors') });
  }
  
  const createdUser = new User({
      email: validator.normalizeEmail(req.body.email.trim(), {gmail_remove_dots: false}),
      password: await bcrypt.hash(authenticateCode, 10),
  })

  User.findOne({ email: createdUser.email }, (err, foundDoc) => {
    if(err) return next(err);

    if(foundDoc) {
      req.flash('errors', 'an account with that email/username already exists');
      return res.render('createUser', { user: req.user, messages: req.flash('errors') });
    }

    createdUser.save((err, SavedDoc) => {
      if (err) return next(err)

      if(SavedDoc){
        //send code by email or redirect
        req.flash('errors', `Account created successfully, verification code for account is ${authenticateCode}`);
        return res.render('createUser', { user: req.user, messages: req.flash('errors') });
      }

      // req.logIn(createdUser, (err) => { //this is for logging the created account in which in this case we don't want to do.
      //   if (err) return next(err)
      //   res.redirect('/auth/user')
      // })

    })
  })
}

export async function addAdmin(req, res, next){
  const errors = [];

  //does an admin exist
  User.findOne({ admin: true }, (err, foundDoc) => {
    if(err) return next(err);

    if(foundDoc) {
      req.flash('errors', 'an admin account already exists');
      return res.render('administrator', { user: req.user, messages: req.flash('errors') });
    }
  })

  //validate submitted info
  if(!validator.isEmail(req.body.email.trim())) {
    errors.push('not a valid email');
  }
  if(!validator.isLength(req.body.password, {min: 0})) {
    errors.push('password must be at least 8 chars long');
  }
  if(req.body.password !== req.body.confirmPassword) {
    errors.push('passwords do not match');
  }

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('administrator', { user: req.user, messages: req.flash('errors') });
  }

  //create user objet
  const createdUser = new User({
    email: validator.normalizeEmail(req.body.email.trim(), {gmail_remove_dots: false}),
    password: await bcrypt.hash(req.body.password, 10),
  })

  //verify if already exists
  User.findOne({email: createdUser.email}, (err, foundDoc) => {
    if(err) return next(err);

    if(foundDoc) {
      req.flash('errors', 'an account with that email/username already exists');
      return res.render('administrator', { user: req.user, messages: req.flash('errors') });
    }
    //save new user
    createdUser.save((err, SavedDoc) => {
      if (err) return next(err)

      if(SavedDoc){
        //send verification email
        req.flash('errors', 'Account created');
        return res.render('administrator', { user: req.user, messages: req.flash('errors') });
      }
    })
  })
}

export async function authenticateUser(req, res, next){
  const errors = [];
  
  //validate info
  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(validator.isEmpty(req.body.password)) errors.push('code field cant be blank');

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('verifyaccount', { user: req.user, messages: req.flash('errors') });
  }

  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  //process authentication
  passport.authenticate('local', (err, user, info) => {
    if(err) return next(err);

    if(!user) {
      req.flash('errors', 'Code is incorrect, check spelling or contact administrator');
      console.log('errors2', info)
      return res.render('verifyaccount', { user: req.user, messages: req.flash('errors') });
    }

    if(user) {
      //req.flash('errors', 'user is not registered');
      return res.render(`reset/${req.body.password}`, { user: req.user, messages: req.flash('errors') });
    }

  })(req, res, next)
}

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

export function logout(req, res){
  req.logout(function(err){
    req.session.destroy((err) => {
      if (err) console.log('Error : Failed to destroy the session during logout.', err)
      req.user = null
      res.redirect('/')
    })
  })
}
