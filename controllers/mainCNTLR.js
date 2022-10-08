import validator from 'validator';
import Debt from '../models/Debts.js';
import Debtors from '../models/Debtors.js';
import { nanoid } from 'nanoid';

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
    const debtsInfo = await Debt.find({})
    const debtorsInfo = await Debtors.find({})
    const debtorList = buildList(debtorsInfo, debtsInfo)

    

    res.render('dashboard', {
        user: req.user,
        debtors: debtorList,
        messages: req.flash('errors'),
    })
}

function buildList(list1, list2){
    const newList = {}

    for(let items of list1){
        newList[items.debtorID] = {}
        newList[items.debtorID]['name'] = items.name
        newList[items.debtorID]['fileid'] = items.fileId
    }

    for(let items of list2){
        newList[items.debtorID]['debtamount'] = items.debtAmount
        newList[items.debtorID]['minpayment'] = items.minPayment
        newList[items.debtorID]['startdate'] = items.startDate
    }
    
    return newList;
}

export async function getRegdebt(req,res){
    res.render('newdebt', {
        user: req.user,
        messages: req.flash('errors'),
    })
}

export async function regdebt(req,res){
    const debtorID = nanoid();
    const errors = validateDebtorInfo({
        name: req.body.name,
        debtamount: req.body.debtamount,
        fileid: req.body.fileid,
        minpayment: req.body.minpayment,
        startdate: req.body.startdate,
    })

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
    }

    //submit data to db
    const newDebt = new Debt({
        debtorID: debtorID,
        debtAmount: parseFloat(req.body.debtamount),
        minPayment: parseFloat(req.body.minpayment),
        startDate: req.body.startdate,
    })

    const newDebtor = new Debtors({
        debtorID: debtorID,
        name: req.body.name, 
        fileId: req.body.fileid,
    })

    newDebtor.save((err) => {
        if(err && err.code === 11000){
            console.error(err)
            req.flash('errors', 'The file id already exist in the database.');
            return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
        }else if(err){
            console.error(err)
            req.flash('errors', 'There was an error submitting the data to the database.');
            return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
        }
        newDebt.save((err) => {
            if(err){
                console.error(err)
                req.flash('errors', 'There was an error submitting the data to the database.2');
                return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
            }
            
            return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
        })
    })

}//

function validateDebtorInfo(debtorInfo){
    const errors = [];

    if(!debtorInfo.name && !validator.isLength(debtorInfo.name, {min: 0})){ 
        errors.push('name cannot be empty'); 
    }else{
        if(!validator.isAlpha(debtorInfo.name, 'es-ES', {'ignore': ' '})){ errors.push('Name can only contain letters and spaces'); } //spaces
    }
    if(!debtorInfo.debtamount && !validator.isLength(debtorInfo.debtamount, {min: 0})){ 
        errors.push('Debt amount can not be empty'); 
    }else{
        if(!validator.isCurrency(debtorInfo.debtamount, {require_symbol: false, allow_negatives: false})){ errors.push('Debt Amount can only be a valid positive currency format (###.##)'); }
    }
    if(!debtorInfo.fileid && !validator.isLength(debtorInfo.fileid, {min: 0})){ 
        errors.push('File id cannot be empty'); 
    }else{
        if(!validator.isAlphanumeric(debtorInfo.fileid, 'es-ES', {'ignore': '-'})){ errors.push('File ID can only contain letters, dashes and numbers'); } //dashes
    }
    if(!debtorInfo.minpayment && !validator.isLength(debtorInfo.minpayment, {min: 0})){ 
        errors.push('Minumun payment cannot be empty'); 
    }else{
        if(!validator.isCurrency(debtorInfo.minpayment, {require_symbol: false, allow_negatives: false})){ errors.push( 'Minimum Payment can only be a valid positive currency format (###.##))'); }
    }
    if(!debtorInfo.startdate && !validator.isLength(debtorInfo.startdate, {min: 0})){ 
        errors.push('Start date cannot be empty'); 
    }else{
        if(!validator.isDate(debtorInfo.startdate)){ errors.push('Start Date can only be a valid date format, dd/mm/yyyy.'); } 
    }

    return errors
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