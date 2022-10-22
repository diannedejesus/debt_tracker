import validator from 'validator';
import DebtDB from '../models/Debts.js';
import DebtorsDB from '../models/Debtors.js';
import PaymentDB from '../models/PaymentLog.js';

export async function index(req, res){  
    try{ 
        res.render('index.ejs', { 
            user: req.user,
            messages: req.flash('errors'),
        })
    }catch(err){
        console.log(err)
    }
}

export async function getRegPayment(req, res){
    try{ 
        res.render('newpayment', {
            user: req.user,
            messages: req.flash('errors'),
        })
    }catch(err){
        console.log(err)
    }
}

export async function getCaseInfo(req, res){
    let caseFileId = ""
    let debtorInfo = {}

    if(req.params.id){
        caseFileId = {fileId: req.params.id}
    }else{
        req.flash('errors', 'No file id sent');
        return res.redirect(req.headers.referer);
    }

    try {
        const selectedDebtor = await DebtorsDB.findOne(caseFileId) //await Debtors.findOne(caseFileId)
        if(!selectedDebtor){
            req.flash('errors', req.params.id + ' is not a valid file id');
            return res.redirect(req.headers.referer);
        }
        
        
        const debtForSelected = await DebtDB.findOne({_id: selectedDebtor._id})
        if(!debtForSelected){
            req.flash('errors', 'Error debt information not found: ' + req.params.id);
            return res.redirect(req.headers.referer);
        }

        const payments = await PaymentDB.find({caseID: selectedDebtor._id})

        //create information object
        debtorInfo = {
            name: selectedDebtor.name,
            fileId: selectedDebtor.fileId,
            startDate: debtForSelected.startDate,
            minPayment: debtForSelected.minPayment,
            debt: debtForSelected.debtAmount,
            payments: [],
        }

        //add payment information
        if(payments){
            for(let items of payments){
                debtorInfo.payments.push({
                    paymentDate: items.date, 
                    paymentAmount: items.payment
                })
            }
        }
    } catch (error) {
        console.error(error);
        req.flash('errors', 'An error occured with the database. #004');
        return res.redirect(req.headers.referer);
    }

    res.render('individualcase', {
        user: req.user,
        debtorInfo,
        messages: req.flash('errors'),
    })
}

export async function insertNewPayment(req, res){
    let caseID = "" 
    const errors = validatePaymentInfo({ //validate user submitted info
        payment: req.body.payment,
        date: req.body.date,
        fileid: req.body.fileid,
    })

    //find id
    try {
        caseID = await DebtorsDB.findOne({fileId: req.body.fileid})
        if(!caseID){ errors.push('Case not found'); }
    } catch (error) {
        console.error(error.message);
        errors.push('An error occured with the database. #005');
    }

    //return errors
    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newpayment', { user: req.user, messages: req.flash('errors') });
    }

    //construct data object
    const newPayment = new PaymentDB({
        caseID: caseID._id,
        payment: parseFloat(req.body.payment),
        date: req.body.date,
    })

    //save to database
    newPayment.save((err) => {
        if(err){
            console.error(err)
            req.flash('errors', 'There was an error submitting the data to the database. #003');
            return res.render('newpayment', { user: req.user, messages: req.flash('errors') });
        }

        req.flash('errors', 'Successfully saved.');
    })
    
    res.render('newpayment', {
        user: req.user,
        messages: req.flash('errors'),
    })
}


export async function getDebtorList(req, res){
    try {
        const debtsInfo = await DebtDB.find({})
        const debtorsInfo = await DebtorsDB.find({})
        const paymentInfo = await PaymentDB.find({})
        let debtorList = []

        if(debtsInfo && debtorsInfo){ 
            debtorList = buildList(debtorsInfo, debtsInfo, paymentInfo)
        }
        
        res.render('debtors', {
            user: req.user,
            debtors: debtorList,
            messages: req.flash('errors'),
        })
    } catch (error) {
        console.error(error);
        req.flash('errors', 'Error submitting data to database. #006'); 
    }
}

export async function getDashboard(req, res){
    try {
        const debtsInfo = await DebtDB.find({})

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

function buildList(debtorInfo, debtInfo, paymentInfo){
    const tempList = {}
    const newList = []
    const currentDate = new Date(Date.now())
    // const elapsed = monthElapsed(new Date(items.startDate), currentDate)

    for(let items of debtorInfo){
        tempList[items._id] = {}
        tempList[items._id]['name'] = items.name
        tempList[items._id]['fileid'] = items.fileId
        tempList[items._id]['payments'] = 0
    }

    for(let items of paymentInfo){
        tempList[items.caseID]['payments'] += Number(items.payment)
    }

    for(let items of debtInfo){
        const owed = monthElapsed(new Date(items.startDate), currentDate) * items.minPayment

        newList.push({ 
            name: tempList[items._id]['name'],
            fileId: tempList[items._id]['fileid'],
            currentDebt: items.debtAmount - tempList[items._id]['payments'],
            minPayment: items.minPayment,
            paymentLate: owed >= tempList[items._id]['payments'],
        })
    }

    return newList;
}

export async function getRegdebt(req, res){
    res.render('newdebt', {
        user: req.user,
        messages: req.flash('errors'),
    })
}

export async function insertNewDebt(req, res){
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
        return res.render('newdebt', { 
            user: req.user, 
            messages: req.flash('errors') 
        });
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
            req.flash('errors', 'The file id already exist, a person can not have two debts.');
            return res.render('newdebt', { 
                user: req.user, 
                messages: req.flash('errors') 
            });
        }else if(err){
            console.error(err)
            req.flash('errors', 'Error submitting data to database. #001');
            return res.render('newdebt', { 
                user: req.user, 
                messages: req.flash('errors') 
            });
        }

        if(doc){
            newDebt._id = doc._id

            newDebt.save((err) => {
                if(err){
                    newDebtor.findOneAndDelete(
                        { _id: doc._id },
                        function(err, res){
                            if (err) {
                              console.log("Error removing data. #001" + err);
                            }
                            else {
                                console.log(res + " deleted!");
                            }
                        }
                    );

                    console.error(err)
                    req.flash('errors', 'Error submitting data to database. #002');
                    return res.render('newdebt', { 
                        user: req.user, 
                        messages: req.flash('errors') 
                    });
                }

                req.flash('errors', 'Data saved successfully.');
                return res.render('newdebt', { 
                    user: req.user, 
                    messages: req.flash('errors') 
                });
            })
        }
    })

}

function validateDebtorInfo(debtorInfo){
    const errors = [];

    if(!debtorInfo.name && !validator.isLength(debtorInfo.name, {min: 0})){ 
        errors.push('name cannot be empty'); 
    }else{
        if(!validator.isAlpha(debtorInfo.name, 'es-ES', {'ignore': ' '})){ errors.push('Name can only contain letters and spaces'); }
    }
    
    if(!debtorInfo.debtamount && !validator.isLength(debtorInfo.debtamount, {min: 0})){ 
        errors.push('Debt amount can not be empty'); 
    }else{
        if(!validator.isCurrency(debtorInfo.debtamount, {require_symbol: false, allow_negatives: false})){ errors.push('Debt Amount can only be a valid positive currency format (###.##)'); }
    }
    
    if(!debtorInfo.fileid && !validator.isLength(debtorInfo.fileid, {min: 0})){ 
        errors.push('File id cannot be empty'); 
    }else{
        if(!validator.isAlphanumeric(debtorInfo.fileid, 'es-ES', {'ignore': '-'})){ errors.push('File ID can only contain letters, dashes and numbers'); }
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

function validatePaymentInfo(paymentInfo){
    const errors = [];
    
    if(!paymentInfo.payment && !validator.isLength(paymentInfo.payment, {min: 0})){ 
        errors.push('Payment cannot be empty'); 
    }else{
        if(!validator.isCurrency(paymentInfo.payment, {require_symbol: false, allow_negatives: false})){ errors.push( 'Payment can only be a valid positive currency format (###.##))'); }
    }
    
    if(!paymentInfo.date && !validator.isLength(paymentInfo.date, {min: 0})){ 
        errors.push('Date cannot be empty'); 
    }else{
        if(!validator.isDate(paymentInfo.date)){ errors.push('Date can only be a valid date format, dd/mm/yyyy.'); } 
    }
    
    if(!paymentInfo.fileid && !validator.isLength(paymentInfo.fileid, {min: 0})){ 
        errors.push('File id cannot be empty'); 
    }else{
        if(!validator.isAlphanumeric(paymentInfo.fileid, 'es-ES', {'ignore': '-'})){ errors.push('File ID can only contain letters, dashes and numbers'); }
    }

    return errors
}