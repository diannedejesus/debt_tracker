import validator from 'validator';
import DebtDB from '../models/Debts.js';
import DebtorsDB from '../models/Debtors.js';
import PaymentDB from '../models/PaymentLog.js';
//import { restart } from 'nodemon';

export async function index(req, res){  
    res.render('index.ejs', { 
        user: req.user,
        messages: [...req.flash('errors'), ...req.flash('msg')],
    })
}

export async function getRegPayment(req, res){
    res.render('newpayment', {
        user: req.user,
        messages: [...req.flash('errors'), ...req.flash('msg')]
    })
}

export async function getCaseInfo(req, res){
    const debtorsList =  await DebtorsDB.find().select("name fileId")
    let caseFileId = {fileId: req.params.id}

    if(!caseFileId.fileId){
        req.flash('errors', 'No file id sent');
        return res.redirect(req.headers.referer);
    }

    const debtorInfo = await buildDebtorInfo(caseFileId)

    res.render('individualcase', {
        user: req.user,
        debtorInfo,
        debtorsList,
        messages: [...req.flash('errors'), ...req.flash('msg')]
    })
}

export async function getTestCaseInfo(req, res){
    const debtorsList =  await DebtorsDB.find().select("name fileId")
    let caseFileId = {fileId: req.params.id}

    if(!caseFileId.fileId){
        req.flash('errors', 'No file id sent');
        return res.redirect(req.headers.referer);
    }

    try {
        const debtorInfo = await buildTestInfo(caseFileId)

        res.render('individualcase', {
            user: req.user,
            debtorInfo,
            debtorsList,
            messages: [...req.flash('errors'), ...req.flash('msg')]
        })

    } catch (error) {
        console.error(error);
    }
    
    
}

export async function getPrintView(req, res){
    const debtorsList =  await DebtorsDB.find().select("name fileId")
    let caseFileId = {fileId: req.params.id}
    
    if(!caseFileId.fileId){
        req.flash('errors', 'No file id sent');
        return res.redirect(req.headers.referer);
    }

    const debtorInfo = await buildDebtorInfo(caseFileId)

    res.render('printview', {
        user: req.user,
        debtorInfo,
        debtorsList,
        messages: [...req.flash('errors'), ...req.flash('msg')]
    })
}

async function buildDebtorInfo(caseFileId){
    try {
        const selectedDebtor = await DebtorsDB.findOne(caseFileId)
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
        const debtorInfo = {
            name: selectedDebtor.name,
            fileId: selectedDebtor.fileId,
            startDate: debtForSelected.startDate.setDate(debtForSelected.startDate.getDate()+1),
            minPayment: debtForSelected.minPayment,
            debt: debtForSelected.debtAmount,
            elapsed: monthElapsed(new Date(debtForSelected.startDate)),
            totalPaid: 0,
            payments: [],
            billed: [],
        }

        //add payment information
            
        let owedPaymentsDate = new Date(debtorInfo.startDate)
            owedPaymentsDate.setDate(1)

        //adding due payments
        for(let i = 0; i<debtorInfo.elapsed; i++){
            debtorInfo.billed.push({
                paymentDate: new Date(owedPaymentsDate.setMonth(owedPaymentsDate.getMonth()+1)),
                paymentAmount: 0,
                space: 0,
            })
        }

        if(!payments){ return debtorInfo }

        for(let items of payments){
            debtorInfo['totalPaid'] += Number(items.payment)

            debtorInfo.payments.push({
                paymentDate: items.date.setDate(items.date.getDate()+1), 
                paymentAmount: items.payment,
                paymentComment: items.comment,
                space: 0,
            })
        }

        debtorInfo.payments.sort(function(a,b){
            return a.paymentDate - b.paymentDate;
          });

        let totalPaid = debtorInfo.totalPaid
        for(let items of debtorInfo.billed){
            if(totalPaid >= debtorInfo.minPayment){
                items.paymentAmount = "paid"
                totalPaid -= debtorInfo.minPayment
            }else if(totalPaid >= 0){
                items.paymentAmount = totalPaid - debtorInfo.minPayment
                totalPaid = 0
            }

        }

        if(debtorInfo.payments.length === 0){
            console.log(debtorInfo)
            return debtorInfo
        }

        console.log(debtorInfo)
       //-----------------
        let payCounter = 0
        let billCounter = 0
        let currentPayment = 0 - +debtForSelected.minPayment

        while(currentPayment > 0 || payCounter < debtorInfo.payments.length){
            if(currentPayment >= 0 && billCounter < debtorInfo.billed.length-1){
                billCounter++
                if(currentPayment !== 0) debtorInfo.billed[billCounter]['space'] = 1
                currentPayment -= +debtForSelected.minPayment //debtorInfo.billed[billCounter].paymentAmount
                debtorInfo.payments[payCounter-1]['space']++
                
            }
 
            if(currentPayment <= 0 && payCounter < debtorInfo.payments.length){
                if(Number(debtorInfo.payments[payCounter].paymentAmount) === 0){
                    debtorInfo.payments[payCounter]['space'] = 1
                    debtorInfo.billed[billCounter]['space']++
                }else{
                    currentPayment += +debtorInfo.payments[payCounter].paymentAmount
                    if(currentPayment !== 0) debtorInfo.payments[payCounter]['space'] = 1
                    if(currentPayment === 0 && payCounter === debtorInfo.payments.length-1) debtorInfo.payments[payCounter]['space'] = 1
                    debtorInfo.billed[billCounter]['space']++
                }
                payCounter++
            }
        }

console.log(debtorInfo)

        return debtorInfo

    } catch (error) {
        console.error(error);
        //req.flash('errors', 'An error occured with the database. #004');
        //return res.redirect(req.headers.referer);
    }
}

async function buildTestInfo2(caseFileId){
    try {
        const selectedDebtor = await DebtorsDB.findOne(caseFileId)
        if(!selectedDebtor){
            req.flash('errors', req.params.id + ' is not a valid file id');
            return res.redirect(req.headers.referer);
        }
        
        const debtForSelected = await DebtDB.findOne({_id: selectedDebtor._id})
        if(!debtForSelected){
            req.flash('errors', 'Error debt information not found: ' + req.params.id);
            return res.redirect(req.headers.referer);
        }
        
        //create information object
        const debtorInfo = {
            name: selectedDebtor.name,
            fileId: selectedDebtor.fileId,
            startDate: debtForSelected.startDate.setDate(debtForSelected.startDate.getDate()+1),
            minPayment: debtForSelected.minPayment,
            debt: debtForSelected.debtAmount,
            elapsed: monthElapsed(new Date(debtForSelected.startDate)),
            totalPaid: 0,
            payments: [
                {
                  paymentDate: '2021-07-18T14:30:48.271Z',
                  paymentAmount: 17,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2021-09-18T11:16:44.363Z',
                  paymentAmount: 37,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2021-10-26T05:49:06.248Z',
                  paymentAmount: 18,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-02-08T09:09:52.586Z',
                  paymentAmount: 42,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-02-10T05:20:03.626Z',
                  paymentAmount: 9,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-04-05T20:35:16.364Z',
                  paymentAmount: 44,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-04-19T23:09:44.341Z',
                  paymentAmount: 30,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-05-05T03:47:17.374Z',
                  paymentAmount: 43,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-05-07T19:07:43.685Z',
                  paymentAmount: 12,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-05-22T12:51:08.661Z',
                  paymentAmount: 32,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-05-23T09:53:51.863Z',
                  paymentAmount: 45,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-06-24T05:43:45.945Z',
                  paymentAmount: 29,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-06-28T07:15:34.091Z',
                  paymentAmount: 45,
                  paymentComment: '',
                  space: 0
                },
                {
                  paymentDate: '2022-09-28T10:52:43.284Z',
                  paymentAmount: 32,
                  paymentComment: '',
                  space: 0
                }
              ],
            billed: [],
        }

        
        //add payment information
            
        let owedPaymentsDate = new Date(debtorInfo.startDate)
            owedPaymentsDate.setDate(1)

        //adding due payments
        for(let i = 0; i<debtorInfo.elapsed; i++){
            debtorInfo.billed.push({
                paymentDate: new Date(owedPaymentsDate.setMonth(owedPaymentsDate.getMonth()+1)),
                paymentAmount: 0,
                space: 0,
            })
        }

        //only for static data
        for(let payments of debtorInfo.payments){
            let currentPay = payments.paymentAmount
            debtorInfo['totalPaid'] += currentPay
        }

        //random data
        // const paymentAmounts = Math.floor(Math.random() * 15);

        // while(debtorInfo.payments.length < paymentAmounts && debtorInfo['totalPaid'] < debtorInfo.debt){
        //     let currentPay = Math.floor(Math.random() * 50)
            
        //     debtorInfo['totalPaid'] += currentPay

        //     debtorInfo.payments.push({
        //         paymentDate: randomDate(debtForSelected.startDate, new Date()), 
        //         paymentAmount: currentPay,
        //         paymentComment: '',
        //         space: 0,
        //     })
        // }

        debtorInfo.payments.sort(function(a,b){
            return a.paymentDate - b.paymentDate;
          });

        //   first case 0 test
        //   debtorInfo['totalPaid'] -= debtorInfo.payments[0].paymentAmount
        //   debtorInfo.payments[0].paymentAmount = 0

        let totalPaid = debtorInfo.totalPaid
        for(let items of debtorInfo.billed){
            if(totalPaid >= debtorInfo.minPayment){
                items.paymentAmount = "paid"
                totalPaid -= debtorInfo.minPayment
            }else if(totalPaid >= 0){
                items.paymentAmount = totalPaid - debtorInfo.minPayment
                totalPaid = 0
            }

        }

        if(debtorInfo.payments.length === 0){
            console.log(debtorInfo)
            return debtorInfo
        }

        console.log(debtorInfo)
       //-----------------
       let payCounter = 0
       let billCounter = 0
       let currentPayment = 0 - +debtForSelected.minPayment

       while(currentPayment > 0 || payCounter < debtorInfo.payments.length){
           if(currentPayment > 0 && billCounter < debtorInfo.billed.length-1){
                billCounter++
                currentPayment -= +debtForSelected.minPayment //debtorInfo.billed[billCounter].paymentAmount
                debtorInfo.payments[payCounter-1]['space']++
                if(currentPayment !== 0) debtorInfo.billed[billCounter]['space'] = 1
           }else if(currentPayment === 0 && billCounter < debtorInfo.billed.length-1){
                billCounter++
                currentPayment -= +debtForSelected.minPayment //debtorInfo.billed[billCounter].paymentAmount
                debtorInfo.payments[payCounter-1]['space']++
           }

           if(currentPayment <= 0 && payCounter < debtorInfo.payments.length){
               if(Number(debtorInfo.payments[payCounter].paymentAmount) === 0){
                   debtorInfo.payments[payCounter]['space'] = 1
                   debtorInfo.billed[billCounter]['space']++
               }else{
                   currentPayment += +debtorInfo.payments[payCounter].paymentAmount
                   if(currentPayment !== 0) debtorInfo.payments[payCounter]['space'] = 1
                   if(currentPayment === 0 && payCounter === debtorInfo.payments.length-1) debtorInfo.payments[payCounter]['space'] = 1
                   debtorInfo.billed[billCounter]['space']++
               }
               payCounter++
           }
       }


console.log(debtorInfo)

        return debtorInfo

    } catch (error) {
        throw error 
        //req.flash('errors', 'An error occured with the database. #004');
        //return res.redirect(req.headers.referer);
    }
}

async function buildTestInfo(caseFileId){
    try {
        const selectedDebtor = await DebtorsDB.findOne(caseFileId)
        if(!selectedDebtor){
            req.flash('errors', req.params.id + ' is not a valid file id');
            return res.redirect(req.headers.referer);
        }
        
        const debtForSelected = await DebtDB.findOne({_id: selectedDebtor._id})
        if(!debtForSelected){
            req.flash('errors', 'Error debt information not found: ' + req.params.id);
            return res.redirect(req.headers.referer);
        }
        
        //create information object
        const debtorInfo = {
            name: selectedDebtor.name,
            fileId: selectedDebtor.fileId,
            startDate: debtForSelected.startDate.setDate(debtForSelected.startDate.getDate()+1),
            minPayment: Number(debtForSelected.minPayment),
            debt: debtForSelected.debtAmount,
            elapsed: monthElapsed(new Date(debtForSelected.startDate)),
            totalPaid: 0,
            payments: [],
            billed: [],
        }

        
        //add payment information
            
        let owedPaymentsDate = new Date(debtorInfo.startDate)
            owedPaymentsDate.setDate(1)

        //adding due payments
        for(let i = 0; i<debtorInfo.elapsed; i++){
            debtorInfo.billed.push({
                paymentDate: new Date(owedPaymentsDate.setMonth(owedPaymentsDate.getMonth()+1)),
                paymentAmount: 0,
                space: 1,
            })
        }

        //only for static data
        // for(let payments of debtorInfo.payments){
        //     let currentPay = payments.paymentAmount
        //     debtorInfo['totalPaid'] += currentPay
        // }

        //random data
        const paymentAmounts = Math.floor(Math.random() * 15);

        while(debtorInfo.payments.length < paymentAmounts && debtorInfo['totalPaid'] < debtorInfo.debt){
            let currentPay = Math.floor(Math.random() * 50)
            
            debtorInfo['totalPaid'] += currentPay

            debtorInfo.payments.push({
                paymentDate: randomDate(debtForSelected.startDate, new Date()), 
                paymentAmount: currentPay,
                paymentComment: '',
                space: 1,
            })
        }

        debtorInfo.payments.sort(function(a,b){
            return a.paymentDate - b.paymentDate;
          });

        //   first case 0 test
        //   debtorInfo['totalPaid'] -= debtorInfo.payments[0].paymentAmount
        //   debtorInfo.payments[0].paymentAmount = 0

        let totalPaid = debtorInfo.totalPaid
        for(let items of debtorInfo.billed){
            if(totalPaid >= debtorInfo.minPayment){
                items.paymentAmount = "paid"
                totalPaid -= debtorInfo.minPayment
            }else if(totalPaid >= 0){
                items.paymentAmount = totalPaid - debtorInfo.minPayment
                totalPaid = 0
            }

        }

        if(debtorInfo.payments.length === 0){
            console.log(debtorInfo)
            return debtorInfo
        }

        console.log(debtorInfo)
       //-----------------
        let bill = 0
        let payment = 0
        let balance = -debtorInfo.minPayment + debtorInfo.payments[payment].paymentAmount
        let billContinue = () => {
            balance += debtorInfo.payments[payment].paymentAmount
        }
        let paymentContinue = () => {
            balance += -debtorInfo.minPayment
        }
        let zeroStart = () => {
            balance = -debtorInfo.minPayment + debtorInfo.payments[payment].paymentAmount
        }

       
        while(payment < debtorInfo.payments.length-1){
            if(balance < 0 && bill < debtorInfo.billed.length) {
                payment++ //payment ends
                debtorInfo.billed[bill].space++ //bill continues
                billContinue()
            }

            if(balance > 0 && payment < debtorInfo.payments.length){
                debtorInfo.payments[payment].space++ //payment continues
                bill++ //bill ends
                paymentContinue()
            }

            if(balance === 0){
                bill++ //bill ends
                payment++ //pay ends
                zeroStart()
            }
        }

console.log(debtorInfo)

        return debtorInfo

    } catch (error) {
        throw error 
        //req.flash('errors', 'An error occured with the database. #004');
        //return res.redirect(req.headers.referer);
    }
}

function randomDate(start, end){
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export async function getRegdebt(req, res){
    res.render('newdebt', {
        user: req.user,
        messages: [...req.flash('errors'), ...req.flash('msg')]
    })
}



export async function insertNewPayment(req, res){
    //NOTE:: think about renaming caseid
    let caseID = "" 
    const errors = dataVerifier({ //validate user submitted info
        payment: req.body.payment,
        date: req.body.date,
        fileid: req.body.fileid,
    })

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newpayment', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }

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
        return res.render('newpayment', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
    }

    //construct data object
    const newPayment = new PaymentDB({
        caseID: caseID._id,
        payment: parseFloat(req.body.payment),
        date: req.body.date,
        comment: req.body.comment //NOTE:: any reason to validate?
    })

    //save to database
    newPayment.save((err) => {
        if(err){
            console.error(err)
            req.flash('errors', 'There was an error submitting the data to the database. #003');
            return res.render('newpayment', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] });
        }

        req.flash('msg', 'Successfully saved.');
    })
    
    res.render('newpayment', {
        user: req.user,
        messages: [...req.flash('errors'), ...req.flash('msg')],
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
            messages: [...req.flash('errors'), ...req.flash('msg')],
        })

    } catch (error) {
        console.error(error);
        req.flash('errors', 'Error submitting data to database. #006');
        res.render('debtors', { user: req.user, messages: [...req.flash('errors'), ...req.flash('msg')] })
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
            const payments = await PaymentDB.find({caseID: items._id}).count() //NOTE:: can slow things if dealing with bad connection or lots of items

            if( elapsed-payments > 0){
                debtorList['latePayments']++
            }else{
                debtorList['currentPayments']++
            }
        }
        
        res.render('dashboard', {
            user: req.user,
            debtors: debtorList,
            messages: [...req.flash('errors'), ...req.flash('msg')],
        })

    } catch (error) {
        console.error(error.message);
        req.flash('errors', 'There was an error submitting the data to the database. #006'); 
    }
}

function monthElapsed(endDate, starterDater = new Date()) {
    let months;
    months = (starterDater.getFullYear() - endDate.getFullYear()) * 12;
    months -= endDate.getMonth();
    months += starterDater.getMonth();
    return months <= 0 ? 0 : months;
}

function buildList(debtorInfo, debtInfo, paymentInfo){
    const tempList = {}
    const newList = []

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
        const owed = monthElapsed(new Date(items.startDate)) * items.minPayment

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


export async function insertNewDebt(req, res){
    //validate submitted info
    const errors = dataVerifier({
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
            messages: [...req.flash('errors'), ...req.flash('msg')]
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
    newDebtor.save((err, savedDoc) => {
        if(err && err.code === 11000){
            console.error(err)
            req.flash('errors', 'The file id already exist, a person can not have two debts.');
            return res.render('newdebt', { 
                user: req.user, 
                messages: [...req.flash('errors'), ...req.flash('msg')]
            });
        }else if(err){
            console.error(err)
            req.flash('errors', 'Error submitting data to database. #001');
            return res.render('newdebt', { 
                user: req.user, 
                messages: [...req.flash('errors'), ...req.flash('msg')] 
            });
        }

        if(savedDoc){
            newDebt._id = savedDoc._id

            newDebt.save((err) => {
                if(err){
                    newDebtor.findOneAndDelete(
                        { _id: savedDoc._id },
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
                        messages: [...req.flash('errors'), ...req.flash('msg')] 
                    });
                }

                req.flash('msg', 'Data saved successfully.');
                return res.render('newdebt', { 
                    user: req.user, 
                    messages: [...req.flash('errors'), ...req.flash('msg')]
                });
            })
        }
    })

}

function dataVerifier(data){
    const errors = [];

    if(data.name !== undefined){
        if(!validator.isLength(data.name, {min: 1})){ 
            errors.push('name cannot be empty');
        }else if(!validator.isAlpha(data.name, 'es-ES', {'ignore': ' '})){
            errors.push('Name can only contain letters and spaces');
        }
    }

    if(data.debtamount !== undefined){
        if(!validator.isLength(data.debtamount, {min: 1})){ 
            errors.push('Debt amount can not be empty');
        }else if(!validator.isCurrency(data.debtamount, {require_symbol: false, allow_negatives: false})){ 
            errors.push('Debt Amount can only be a valid positive currency format (###.##)');
        }
    }
    
    if(data.fileid !== undefined){
        if(!validator.isLength(data.fileid, {min: 1})){ 
            errors.push('File id cannot be empty');
        }else if(!validator.isAlphanumeric(data.fileid, 'es-ES', {'ignore': '-'})){
            errors.push('File ID can only contain letters, dashes and numbers');
        }
    }
    
    if(data.minpayment !== undefined){
        if(!validator.isLength(data.minpayment, {min: 1})){
            errors.push('Minumun payment cannot be empty');
        }else if(!validator.isCurrency(data.minpayment, {require_symbol: false, allow_negatives: false})){
            errors.push( 'Minimum Payment can only be a valid positive currency format (###.##))');
        }
    }
    
    if(data.startdate !== undefined){
        if(!validator.isLength(data.startdate, {min: 1})){
            errors.push('Start date cannot be empty');
        } else if(!validator.isDate(data.startdate)){
            errors.push('Start Date can only be a valid date format, dd/mm/yyyy.');
        }
    }

    if(data.payment !== undefined){
        if(!validator.isLength(data.payment, {min: 1})){
            errors.push('Payment cannot be empty');
        }else if(!validator.isCurrency(data.payment, {require_symbol: false, allow_negatives: false})){
            errors.push( 'Payment can only be a valid positive currency format (###.##))');
        }
    }

    if(data.date !== undefined){
        if(!validator.isLength(data.date, {min: 1})){
            errors.push('Date cannot be empty');
        }else if(!validator.isDate(data.date)){
            errors.push('Date can only be a valid date format, dd/mm/yyyy.');
        }
    }
    
    return errors
}