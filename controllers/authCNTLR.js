import passport from 'passport';
import User from '../models/User.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import Registration from '../models/Registration.js';
import crypto from 'node:crypto';



export async function getCreateAdmin(req, res){
  const errors = [];
  const adminAccount = await User.findOne({admin:true}); //verify if an admin account exists

  if(adminAccount){
    errors.push('Administrator account already exists');

    req.flash('errors', errors);
    res.redirect('/');
  }else {
    res.render('administrator', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
  }
};

export async function getReset(req, res){
  res.render('reset', { 
    user: req.user,
    messages: [...req.flash('errors'), ...req.flash('msg')] 
  });
};

export async function getVerifyAccount(req, res){
  res.render('verifyaccount', {
    user: req.user, 
    token: req.params.token,
    userid: req.params.userid,
    messages: [...req.flash('errors'), ...req.flash('msg')] });
};

export async function getLogin(req, res){
  res.render('login', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
};

export async function getUserAdmin(req, res){
  const errors = [];
  
  if(req.user.admin){
    const userList = await User.find({}).select("email revoked");
    const verificationList = await Registration.find({}).select("email");
    const pendingReset = {}

    for(let item of verificationList){
      pendingReset[item.email] = true
    }

    for(let item of userList){
      if(pendingReset[item.email]){
        item['verifying'] = true
      }else{
        item['verifying'] = false
      }
    }

    res.render('createUser', { 
      user: req.user,
      userList,
      messages: [...req.flash('errors'), ...req.flash('msg')]
    });
  } else {
    errors.push('Not an administrator account');
    req.flash('errors', errors);

    res.render('dashboard', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
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
    return res.render('login', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
  }

  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  //process authentication
  passport.authenticate('local', (err, user, info) => {
    if(err) return next(err);

    if(!user) {
      req.flash('errors', 'User does not exist, check spelling or contact administrator');
      console.log('errors2', info)
      return res.render('login', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }

    if(user.revoked) {
      req.flash('errors', 'user access was revoked, contact administrator');
      return res.render('login', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }

    req.logIn(user, (err) => {
      if(err) return next(err);
      res.redirect(req.session.returnTo || '/')
    })
  })(req, res, next)
}

export async function addUser(req, res, next){
  const errors = [];

  //validate submitted info
  if(!validator.isEmail(req.body.email.trim())) errors.push('not a valid email');
  if(!req.user.admin) errors.push('not an administrator account');

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('createUser', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
  }
  
  const CreatedUser = new User({
      email: validator.normalizeEmail(req.body.email.trim(), {gmail_remove_dots: false}),
      password: crypto.randomBytes(32).toString("hex"),
  })

  User.findOne({ email: CreatedUser.email }, (err, foundDoc) => {
    if(err) return next(err);

    if(foundDoc) {
      req.flash('errors', 'an account with that email/username already exists');
      return res.render('createUser', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }
  })

  CreatedUser.save((err, SavedDoc) => {
    if (err) return next(err) //NOTE::does this stop execution? will if(!SavedDoc) run? will code after save call run? 

    if(!SavedDoc){
      req.flash('errors', 'Account could not be created.');
      return res.render('createUser', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }
  })

  const authToken = await createAuthenticationCode(CreatedUser.email);
        
  if(authToken){
     //send code by email or redirect
    req.flash('msg', `Account created successfully, verification code for account is ${authToken} or send the link: CLIENT_URL/verifyaccount/${authToken}/${CreatedUser.email}`);
  }else{
    //NOTE::if code is not created the user can just reset password to get new code
    console.log(authToken)
    req.flash('errors', 'Error reseting password')
  }

  return res.render(req.headers.referer);
}

export async function addAdmin(req, res, next){
  const errors = [];

  //does an admin exist
  User.findOne({ admin: true }, (err, foundDoc) => {
    if(err) return next(err);

    if(foundDoc) {
      req.flash('errors', 'an admin account already exists');
      return res.render('administrator', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }
  })

  //validate submitted info
  if(!validator.isEmail(req.body.email.trim())) errors.push('not a valid email');
  if(!validator.isLength(req.body.password, {min: 8})) errors.push('password must be at least 8 chars long');
  if(req.body.password !== req.body.confirmPassword) errors.push('passwords do not match');

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('administrator', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
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
      return res.render('administrator', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }
    //save new user
    createdUser.save((err, SavedDoc) => {
      if (err) return next(err)

      if(SavedDoc){
        //send verification email
        req.flash('errors', 'Account created');
        return res.render('administrator', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
      }
    })
  })
}

export async function authenticateUser(req, res, next){
  const errors = [];

  //validate info
  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(validator.isEmpty(req.body.token)) errors.push('invalid token');
  if(!validator.isLength(req.body.password, {min: 8})) errors.push('password must be at least 8 chars long');
  if(req.body.password !== req.body.confirmPassword) errors.push('passwords do not match');

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('verifyaccount', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
  }

  //validate with database
  let resetInfo = await Registration.findOne({ email: req.body.email })
  if (!token) errors.push("Invalid or expired password reset token.");

  const isValid = await bcrypt.compare(req.body.token, resetInfo.token);
  if (!isValid) errors.push("Invalid password reset token.");

  if(errors.length) {
    req.flash('errors', errors);
    return res.render('verifyaccount', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
  }

  //set values
  const userEmail = validator.normalizeEmail(req.body.email.trim(), {gmail_remove_dots: false})
  const hashedPassword = await bcrypt.hash(req.body.password, 10)
 
  //update
  User.findOneAndUpdate({ email: userEmail }, { password: hashedPassword }, (err) => {
    if(err) return next(err);

    //delete token
    Registration.deleteOne({email: userEmail}, (err) => {
      if(err) return next(err);
    })
  })

  req.flash('msg', "Account verified, new passord created");
  return res.render('login', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
}

export async function resetPassword(req, res, next){
  const errors = [];

  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(!req.user.admin) errors.push('not an administrator account');

  if(errors.length) {
    req.flash('errors', errors);
    return res.redirect(req.headers.referer);
  }

  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  const authToken = await createAuthenticationCode(req.body.email);

  if(authToken){
    req.flash('msg', `Account created successfully, verification code for account is ${authToken} or send the link: CLIENT_URL/verifyaccount/${authToken}/${req.body.email}`);
  }else{
    console.log(authToken)
    req.flash('errors', authToken.message)
  }
 
  return res.redirect(req.headers.referer);
};

export async function revokeToggle(req, res, next){
  const errors = [];

  if(!validator.isEmail(req.body.email.trim())) errors.push('email is invalid');
  if(!req.user.admin) errors.push('not an administrator account');
  if(req.user.email === req.body.email) errors.push('can not revoke access');

  if(errors.length) {
    req.flash('errors', errors);
    return res.redirect(req.headers.referer);
  }

  req.body.email = validator.normalizeEmail(req.body.email.trim(), { gmail_remove_dots: false });

  const toggleAccess = await User.findOne({email: req.body.email})
  await User.updateOne({email: req.body.email}, {revoked: !toggleAccess.revoked})
 
  return res.redirect(req.headers.referer);
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


//functions
async function createAuthenticationCode(userIdentity){
  const resetToken = nanoid(10);

  const AuthenticationCode = new Registration({
    email: userIdentity,
    token: await bcrypt.hash(resetToken, 10),
  })

  Registration.deleteMany({email: AuthenticationCode.email}, (err) => {
    if(err) return err;
  })

  AuthenticationCode.save((err, savedDoc) => {
    if (err) {
      resetToken = null
      return err
    }

    if(!savedDoc){
      resetToken = null
    }
  })

  return resetToken
}