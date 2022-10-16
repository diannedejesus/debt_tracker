import validator from 'validator';
import Debt from '../models/Debts.js';
import Debtors from '../models/Debtors.js';
import PaymentDB from '../models/PaymentLog.js';

export async function index(req,res){  
    try{ 
        res.render('index.ejs', { 
            user: req.user,
            messages: req.flash('errors'),
        })
    }catch(err){
        console.log(err)
    }
}

export async function getRegPayment(req,res){
    try{ 
        res.render('newpayment', {
            user: req.user,
            messages: req.flash('errors'),
        })
    }catch(err){
        console.log(err)
    }
}

export async function getCaseInfo(req,res){
    let currentLink = ""
    let debtorInfo = {}

    if(req.params.id){
        currentLink = {fileId: req.params.id}
    }else{
        //error
        req.flash('errors', 'No file id sent');
        return res.redirect(req.headers.referer);
    }

    try {
        const debtor = await Debtors.find(currentLink)
        if(!debtor){
            req.flash('errors', req.params.id + ' is not a valid file id');
            return res.redirect(req.headers.referer);
        }
        const debt = await Debt.find({_id: debtor[0]._id})
        const payments = await PaymentDB.find({caseID: debtor[0]._id})

        if(!debt){
            req.flash('errors', 'Error searching for debt information for: ' + req.params.id);
            return res.redirect(req.headers.referer);
        }

        debtorInfo = {
            debtorName: debtor[0].name,
            debtorFileId: debtor[0].fileId,
            debtorStartDate: debt[0].startDate,
            debtorMinPayment: debt[0].minPayment,
            debtorDebt: debt[0].debtAmount,
            debtorPayments: [],
        }

        if(payments){
            for(let items of payments){
                debtorInfo.debtorPayments.push({paymentDate: items.date, paymentAmount: items.payment})
            }
        }
    } catch (error) {
        console.error(error.message);
        req.flash('errors', 'An error occured with the database. #004');
        return res.redirect(req.headers.referer);
    }

    res.render('individualcase', {
        user: req.user,
        debtorInfo,
        messages: req.flash('errors'),
    })
}

export async function regPayment(req,res){
    const errors = [];
    const caseID = "" 

    //find reference id
    try {
        caseID = await Debtors.find({fileId: req.body.fileid})
    } catch (error) {
        console.error(error.message);
        errors.push('An error occured with the database. #005');
    }
    
    //validate user submitted and other info
    if(!req.body.payment && !validator.isLength(req.body.payment, {min: 0})){ 
        errors.push('Payment cannot be empty'); 
    }else{
        if(!validator.isCurrency(req.body.payment, {require_symbol: false, allow_negatives: false})){ errors.push( 'Payment can only be a valid positive currency format (###.##))'); }
    }
    if(!req.body.date && !validator.isLength(req.body.date, {min: 0})){ 
        errors.push('Date cannot be empty'); 
    }else{
        if(!validator.isDate(req.body.date)){ errors.push('Date can only be a valid date format, dd/mm/yyyy.'); } 
    }
    if(!caseID){ errors.push('Case not found'); }

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newpayment', { user: req.user, messages: req.flash('errors') });
    }

    //construct data object
    const newPayment = new PaymentDB({
        caseID: caseID[0]._id,
        payment: parseFloat(req.body.payment),
        date: req.body.date,
    })

    //save to database
    newPayment.save((err) => {
        if(err){
            console.error(err)
            req.flash('errors', 'There was an error submitting the data to the database.3');
            return res.render('newpayment', { user: req.user, messages: req.flash('errors') });
        }

        req.flash('errors', 'Successfully saved.');
    })
    
    res.render('newpayment', {
        user: req.user,
        messages: req.flash('errors'),
    })
}


export async function getDebtorList(req,res){
    try {
        const debtsInfo = await Debt.find({})
        const debtorsInfo = await Debtors.find({})
        let debtorList = []

        if(debtsInfo && debtorsInfo){ 
            debtorList = buildList(debtorsInfo, debtsInfo) 
        }
        
        res.render('debtors', {
            user: req.user,
            debtors: debtorList,
            messages: req.flash('errors'),
        })
    } catch (error) {
        console.error(error.message);
        req.flash('errors', 'There was an error submitting the data to the database. #006'); 
    }
}

export async function getDashboard(req,res){
    try {
        const debtsInfo = await Debt.find({})

        let debtorList = {
            'latePayments': 0,
            'currentPayments': 0,
            'debtsCount': debtsInfo ? debtsInfo.length : 0,
        }

        for(let items of debtsInfo){
            const currentDate = new Date(Date.now())
            const elapsed = monthElapsed(new Date(items.startDate), currentDate)
            const payments = await PaymentDB.find({caseID: items._id}).count() //can slow things if dealing with bad connection or lots of items

            if( elapsed-payments > 0){
                debtorList['latePayments']++
            }else{
                debtorList['currentPayments']++
            }
        }
        
        res.render('dashboard', {
            user: req.user,
            debtors: debtorList,
            messages: req.flash('errors'),
        })
    } catch (error) {
        console.error(error.message);
        req.flash('errors', 'There was an error submitting the data to the database. #006'); 
    }
}

function monthElapsed(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

function buildList(debtorInfo, debtInfo){
    const tempList = {}
    const newList = []

    for(let items of debtorInfo){
        tempList[items._id] = {}
        tempList[items._id]['name'] = items.name
        tempList[items._id]['fileid'] = items.fileId
    }

    for(let items of debtInfo){
        newList.push({ 
            name: tempList[items._id]['name'],
            fileId: tempList[items._id]['fileid'],
            debtAmount: items.debtAmount,
            minPayment: items.minPayment,
            startDate: items.startDate,
        })
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
    //validate submitted info
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

    //contruct data objects
    const newDebt = new Debt({
        debtAmount: parseFloat(req.body.debtamount),
        minPayment: parseFloat(req.body.minpayment),
        startDate: req.body.startdate,
    })

    const newDebtor = new Debtors({
        name: req.body.name, 
        fileId: req.body.fileid,
    })

    //submit data to db
    newDebtor.save((err, doc) => {
        if(err && err.code === 11000){
            console.error(err)
            req.flash('errors', 'The file id already exist in the database.');
            return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
        }else if(err){
            console.error(err)
            req.flash('errors', 'There was an error submitting the data to the database.');
            return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
        }

        newDebt._id = doc._id

        newDebt.save((err) => {
            if(err){
                console.error(err)
                req.flash('errors', 'There was an error submitting the data to the database.2');
                return res.render('newdebt', { user: req.user, messages: req.flash('errors') });
            }

            req.flash('errors', 'Data saved successfully.');
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