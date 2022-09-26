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
    res.render('dashboard.ejs', {
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