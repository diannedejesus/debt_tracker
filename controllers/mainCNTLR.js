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
    res.render('newpayment', {
        user: req.user,
        messages: req.flash('errors'),
    })
}

export async function getCaseInfo(req,res){
    let currentLink = ""
    let debtorInfo

    if(req.params.id){
        currentLink = {fileId: req.params.id}
    }

    const debtor = await Debtors.find(currentLink)
    const debt = await Debt.find({_id: debtor[0]._id})
    const payments = await PaymentDB.find({caseID: debtor[0]._id})

    debtorInfo = {
        debtorName: debtor[0].name,
        debtorFileId: debtor[0].fileId,
        debtorStartDate: debt[0].startDate,
        debtorMinPayment: debt[0].minPayment,
        debtorDebt: debt[0].debtAmount,
        debtorPayments: [],
    }

    for(let items of payments){
        debtorInfo.debtorPayments.push({paymentDate: items.date, paymentAmount: items.payment})
    }


    res.render('individualcase', {
        user: req.user,
        debtorInfo,
        messages: req.flash('errors'),
    })
}

export async function regPayment(req,res){
    const errors = [];
    const caseID = await Debtors.find({fileId: req.body.fileid})
    // const debtorsInfo = await Debtors.find({})
    // const debtorList = buildList(debtorsInfo, debtsInfo)

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

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newpayment', { user: req.user, messages: req.flash('errors') });
    }

    const newPayment = new PaymentDB({
        caseID: caseID[0]._id,
        payment: parseFloat(req.body.payment),
        date: req.body.date,
    })

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
        //debtors: debtorList,
        messages: req.flash('errors'),
    })
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
            name: newList[items._id]['name'],
            fileId: newList[items._id]['fileid'],
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
        debtAmount: parseFloat(req.body.debtamount),
        minPayment: parseFloat(req.body.minpayment),
        startDate: req.body.startdate,
    })

    const newDebtor = new Debtors({
        name: req.body.name, 
        fileId: req.body.fileid,
    })

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