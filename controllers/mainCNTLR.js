import validator from 'validator';

export async function index(req,res){ //defining a method with the name index, it with be an asychronous function as defined by the async keyword and the arrow function expression. 
    try{ //when working with async we are working with outside requests which can fail for various reasons. The try/catch pair with run the code and if a request fails it will defaults to catch.
        res.render('index.ejs', { //res as in respond, so we are responding by invoking the render method and telling it to render the page (interprete the code and show the resulting html) index.ejs. We can also pass it an object with key/value pairs for the page to use.
            user: req.user,
            messages: req.flash('errors'),
        })
    }catch(err){
        console.log(err) //display the error in the console
    }
}

export async function getDashboard(req,res){
    res.render('dashboard', {
        user: req.user,
        messages: req.flash('errors'),
    })
}

export async function getRegdebt(req,res){
    res.render('newdebt', {
        user: req.user,
        messages: req.flash('errors'),
    })
}

export async function regdebt(req,res){
    //verify data
        //req.body.name isAlpha(str [, locale, options]) 'en-US'
        //req.body.debtamount isCurrency(str [, options]) require_symbol: false,
        //req.body.fileid isAlphanumeric(str [, locale, options]) 'es-ES'
        //req.body.minpayment
        //req.body.startdate isDate(input [, options])
    //submit data to db
    
    const errors = [];

    if(!req.body.name && !validator.isLength(req.body.name, {min: 0})){ errors.push({msg: 'name cannot be empty'}); }
    if(!req.body.debtamount && !validator.isLength(req.body.debtamount, {min: 0})){ errors.push({msg: 'Debt amount can not be empty'}); }
    if(!req.body.fileid && !validator.isLength(req.body.fileid, {min: 0})){ errors.push({msg: 'File id cannot be empty'}); }
    if(!req.body.minpayment && !validator.isLength(req.body.minpayment, {min: 0})){ errors.push({msg: 'Minumun payment cannot be empty'}); }
    if(!req.body.startdate && !validator.isLength(req.body.startdate, {min: 0})){ errors.push({msg: 'Start date cannot be empty'}); }


    if(!validator.isAlpha(req.body.name, 'es-ES')){ errors.push({msg: 'Only letters can be used'}); } //spaces
    if(!validator.isCurrency(req.body.debtamount, {require_symbol: false})){ errors.push({msg: 'Only currency format permite (numbers and one decimal point with two digits)'}); }
    if(!validator.isCurrency(req.body.minpayment, {require_symbol: false})){ errors.push({msg: 'Only currency format permite (numbers and one decimal point with two digits)'}); }
    if(!validator.isAlphanumeric(req.body.fileid, 'es-ES')){ errors.push({msg: 'Only letters, dashes and numbers can be used'}); } //dashes
    if(!validator.isDate(req.body.startdate)){ errors.push({msg: 'Only a date in the following format, dd/mm/yyyy, can be used'}); } //dashes

    if(!validator.isLength(req.body.password, {min: 0})) {
        errors.push({msg: 'password must be at least 8 chars long'});
    }

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('reset', { user: req.user, messages: req.flash('errors') });
    }
    
    res.render('newdebt', {
        user: req.user,
        messages: req.flash('errors'),
    })
}


// export async function getAdminCreator(req,res){  
// //if no admin account exists then show message saying this, if not show the create administration account page.
//     res.render('administrator.ejs', { 
//         user: req.user,
//         messages: req.flash('errors'),
//     })
// }

// export async function createAdmin(req,res){
//     //validate email
//     //create authorization code
//     //save information in db as email=email, code=password, admin=true
//     //
//     //send user to verification page
//     //req.body.email



//     res.render('administrator.ejs', { 
//         user: req.user,
//         messages: req.flash('errors'),
//     })
// }   