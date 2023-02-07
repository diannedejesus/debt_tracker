import validator from 'validator';
import DebtDB from '../models/Debts.js';
import DebtorsDB from '../models/Debtors.js';
import PaymentDB from '../models/PaymentLog.js';
import { randomizedPayments } from '../controllers/testsCNTLR.js'

export async function index(req, res){  
    res.render('index.ejs', { 
        user: req.user,
        messages: [...req.flash('msg')],
        errors: [...req.flash('errors')],
    })
}

export async function getRegPayment(req, res){
    try {
        const debtorList =  await DebtorsDB.find().select("name fileId")
        const pagevalue = {
            fileid: req.params.fileId,
        }
        const errors = dataVerifier(pagevalue)
    
        if(errors.length) {
            req.flash('errors', errors);
            return res.render('newpayment', { 
                user: req.user, 
                pagevalue,
                debtorList, 
                messages: [...req.flash('msg')], 
                errors: [...req.flash('errors')], 
            });
        }

        res.render('newpayment', {
            user: req.user,
            pagevalue,
            debtorList,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    } catch (error) {
        console.error(error) //does not matter if info could not be accessed

        res.render('newpayment', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

export async function getRegdebt(req, res){
    res.render('newdebt', {
        user: req.user,
        messages: [...req.flash('msg')],
        errors: [...req.flash('errors')],
    })
}

export async function getExcusedPayment(req, res){
    try {
        const debtorList =  await DebtorsDB.find().select("name fileId")

        if(!req.params.id){
            req.flash('error', "No payment selected");
            return res.redirect(req.headers.referer);
        }else{
            const pagevalue = {
                fileid: req.params.id,
            }
            const errors = dataVerifier(pagevalue)
        
            if(errors.length) {
                req.flash('errors', errors);
                return res.redirect(req.headers.referer);
            }
        }

        const dataInfo = {
            fileid: req.params.id,
            date: new Date(),
        }

        res.render('excusedpayment', {
            user: req.user,
            debtorList,
            dataInfo,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    } catch (error) {
        console.error(error) //does not matter if info could not be accessed

        res.render('excusedpayment', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

export async function getEditPayment(req, res){
    if(!req.params.paymentid || !req.params.fileId){
        req.flash('error', "No payment selected");
        return res.redirect(req.headers.referer);
    }else{
        const pagevalue = {
            fileid: req.params.fileId,
            mongoId: req.params.paymentid
        }
        const errors = dataVerifier(pagevalue)
    
        if(errors.length) {
            req.flash('errors', errors);
            return res.redirect(req.headers.referer);
        }
    }

    try {
        const paymentinfo = await PaymentDB.findOne({_id: req.params.paymentid})
        const paymentData = {
            id: paymentinfo._id,
            fileID: req.params.fileId,
            payment: paymentinfo.payment,
            date: paymentinfo.date,
            comment: paymentinfo.comment
        }

        res.render('editpayment', {
            user: req.user,
            paymentData,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
        
    } catch (error) {
        console.error(error)
        req.flash('errors', 'Error finding database info.');

        res.render('editpayment', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

export async function getEditExcusedPayment(req, res){
    if(!req.params.paymentid || !req.params.fileId){
        req.flash('error', "No payment selected");
        return res.redirect(req.headers.referer);
    }else{
        const pagevalue = {
            fileid: req.params.fileId,
            mongoId: req.params.paymentid
        }
        const errors = dataVerifier(pagevalue)
    
        if(errors.length) {
            req.flash('errors', errors);
            return res.redirect(req.headers.referer);
        }
    }

    try {
        const debtorList =  await DebtorsDB.find().select("name fileId")
        const paymentinfo = await PaymentDB.findOne({_id: req.params.paymentid})

        const DataInfo = {
            id: paymentinfo._id,
            fileID: req.params.fileId,
            date: paymentinfo.date,
            comment: paymentinfo.comment
        }

        res.render('editexcusedpayment', {
            user: req.user,
            debtorList,
            dataInfo: DataInfo,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
        
    } catch (error) {
        console.error(error)
        req.flash('errors', 'Error finding database info.');

        res.render('editexcusedpayment', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

export async function getEditDebtor(req, res){
    if(!req.params.id){
        req.flash('error', "No payment selected");
        return res.redirect(req.headers.referer);
    }
    
    try {
        const debtorData = await DebtorsDB.findOne({ fileId: req.params.id })
        const debtData = await DebtDB.findOne({ _id: debtorData._id})

        if(!debtorData) req.flash('error', "No payment found");

        const debtInfo = {
            name: debtorData.name,
            debtamount: debtData.debtAmount,
            fileid: debtorData.fileId,
            minpayment: debtData.minPayment,
            startdate: debtData.startDate,
        }

        res.render('editdebtor', {
            user: req.user,
            debtInfo,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    } catch (error) {
        console.error(error)
        req.flash('errors', error);

        res.render('editdebtor', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

export async function getCaseInfo(req, res){
    try {
        const debtorList =  await DebtorsDB.find().select("name fileId")
        let caseFileId = {fileId: req.params.id}

        if(!caseFileId.fileId){
            req.flash('errors', 'No file id sent');
            return res.redirect(req.headers.referer);
        }

        let debtorInfo = await createDebtorInfo(caseFileId)
        debtorInfo = await createTransactions(debtorInfo)
        
        debtorInfo.totalPaid = debtorInfo.transactions.reduce((sum, current) => {
            let currentNum = current.payment === undefined ? 0 : Number(current.payment);
            return sum + currentNum;
        }, 0);
       
        debtorInfo.late = verifyAccountStatus(debtorInfo, debtorInfo.transactions);

        res.render('individualcase', {
            user: req.user,
            debtorInfo,
            debtorList,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    } catch (error) {
        console.error(error)
        req.flash('errors', error);

        res.render('individualcase', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }  
}

export async function getCaseInfoMerge(req, res){
    try {
        const debtorList =  await DebtorsDB.find().select("name fileId")
        let selectedDebtor = {fileId: req.params.id}

        if(!selectedDebtor.fileId){
            req.flash('errors', 'No file id sent');
            return res.redirect(req.headers.referer);
        }

        for(let debtor of debtorList){
            if(debtor.fileId === selectedDebtor.fileId){
                selectedDebtor.debtorRef = debtor._id
            }
        }

        let createMergeInfo = await createDebtorInfo(selectedDebtor)
        const payments = await PaymentDB.find({caseID: createMergeInfo.id}) //randomizedPayments(100, debtForSelected.startDate)
        
        createMergeInfo.billed = createListOfBills(createMergeInfo.startDate)

        if(createMergeInfo.billed.length * createMergeInfo.minPayment > createMergeInfo.debt){
            let actualBills = Math.ceil(createMergeInfo.debt/createMergeInfo.minPayment)
            createMergeInfo.billed.splice(actualBills)
        }

        createMergeInfo.payments = removeCaseAndVersion(payments),
        createMergeInfo.totalPaid = createMergeInfo.payments.reduce((sum, current) => {
            let currentNum = current.payment === undefined ? 0 : Number(current.payment);
            return sum + currentNum;
        }, 0);
        createMergeInfo = calcPaidStatus(createMergeInfo)
        createMergeInfo = calcMerge(createMergeInfo)
        createMergeInfo.late = verifyAccountStatus(createMergeInfo, createMergeInfo.payments);

        res.render('individualcase-merge-view', {
            user: req.user,
            debtorInfo: createMergeInfo,
            debtorList,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    } catch (error) {
        console.error(error)
        req.flash('errors', error);

        res.render('individualcase-merge-view', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

export async function getPrintView(req, res){
    try {
        const debtorList =  await DebtorsDB.find().select("name fileId")
        let caseFileId = {fileId: req.params.id}
        
        if(!caseFileId.fileId){
            req.flash('errors', 'No file id sent');
            return res.redirect(req.headers.referer);
        }

        let debtorInfo = await createDebtorInfo(caseFileId)
        debtorInfo = await createTransactions(debtorInfo)
        debtorInfo.totalPaid = debtorInfo.transactions.reduce((sum, current) => {
            let currentNum = current.payment === undefined ? 0 : Number(current.payment);
            return sum + currentNum;
        }, 0);


        res.render('printview', {
            user: req.user,
            debtorInfo,
            debtorList,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    } catch (error) {
        console.error(error)
        req.flash('errors', error);

        res.render('printview', {
            user: req.user,
            messages: [...req.flash('msg')],
            errors: [...req.flash('errors')],
        })
    }
}

// export async function getPrintView(req, res){
//     try {
//         const debtorList =  await DebtorsDB.find().select("name fileId")
//         let caseFileId = {fileId: req.params.id}
        
//         if(!caseFileId.fileId){
//             req.flash('errors', 'No file id sent');
//             return res.redirect(req.headers.referer);
//         }

//         const debtorInfo = await buildDebtorInfo(caseFileId)

//         res.render('printview', {
//             user: req.user,
//             debtorInfo,
//             debtorList,
//             messages: [...req.flash('msg')],
//             errors: [...req.flash('errors')],
//         })
//     } catch (error) {
//         console.error(error)
//         req.flash('errors', error);

//         res.render('printview', {
//             user: req.user,
//             messages: [...req.flash('msg')],
//             errors: [...req.flash('errors')],
//         })
//     }
// }

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
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        })

    } catch (error) {
        console.error(error);
        req.flash('errors', 'Error submitting data to database. #006');

        res.render('debtors', { user: req.user, messages: [...req.flash('msg')], errors: [...req.flash('errors')], })
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
            const payments = await PaymentDB.find({caseID: items._id})
            const latePayments = verifyAccountStatus(items, payments)
     
            if(latePayments){
                debtorList['latePayments']++
            }else{
                debtorList['currentPayments']++
            }
        }
        
        res.render('dashboard', {
            user: req.user,
            debtors: debtorList,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        })

    } catch (error) {
        console.error(error.message);
        req.flash('errors', 'There was an error submitting the data to the database. #007');

        res.render('dashboard', {
            user: req.user,
            debtors: '',
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        })
    }
}

//-----------------------------------------------------

export async function insertNewPayment(req, res){
    const debtorList =  await DebtorsDB.find().select("name fileId")
    let debtorRef = ""
    const pagevalues = {
        payment: req.body.payment,
        date: req.body.date,
        fileid: req.body.fileid,
        comment: req.body.comment,
    }
    const errors = dataVerifier(pagevalues)

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newpayment', { 
            user: req.user, 
            pagevalues, 
            debtorList, 
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')], 
        });
    }

    //find id
    try {
        debtorRef = await DebtorsDB.findOne({fileId: req.body.fileid})
        let debtInfo = await DebtDB.findOne({_id: debtorRef._id})
        const paymentInfo = await PaymentDB.find({caseID: debtorRef._id})
        let paymentSum = paymentInfo.reduce((accumulator, currentValue) => accumulator + Number(currentValue.payment), 0 )
        let pendingBalance = debtInfo.debtAmount - paymentSum

        if(!debtorRef){ errors.push('Case not found'); }

        const similiarPayments = await PaymentDB.find({
            payment: req.body.payment,
            date: req.body.date,
            caseID: debtorRef._id
        })

        if(similiarPayments.length > 0){ errors.push(`We found a payment for the same amount and date for this account.`); }

        if(pendingBalance < req.body.payment){errors.push(`Can't add payment. Amount is more than the debt owed for this account. This account owes ${pendingBalance}`)}

    } catch (error) {
        console.error(error.message);
        errors.push('An error occured with the database. #005');
    }

    //return errors
    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newpayment', { 
            user: req.user, 
            pagevalues, 
            debtorList, 
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')], 
        });
    }

    //construct data object
    const newPayment = new PaymentDB({
        caseID: debtorRef._id,
        payment: parseFloat(req.body.payment),
        date: req.body.date,
        comment: req.body.comment
    })

    //save to database
    newPayment.save((err) => { //NOTE:: Callback
        if(err){
            console.error(err._message)
            req.flash('errors', 'There was an error submitting the data to the database. #003');
            return res.render('newpayment', { 
                user: req.user, 
                pagevalues, 
                debtorList, 
                messages: [...req.flash('msg')], 
                errors: [...req.flash('errors')], 
            });
        }

        req.flash('msg', 'Payment Successfully saved.');
        res.redirect(req.headers.referer);

        // res.render('newpayment', {
        //     user: req.user,
        //     debtorList,
        //     messages: [...req.flash('msg')], 
        //     errors: [...req.flash('errors')],
        // })
    })
}

export async function excusedPayment(req, res){
    const debtorList =  await DebtorsDB.find().select("name fileId")
    const dataInfo = { //validate user submitted info
        date: req.body.date,
        fileid: req.body.fileid,
        comment: req.body.comment,
    }
    let debtorRef = "" 
    const errors = dataVerifier(dataInfo)

    if(errors.length) {
        req.flash('errors', errors);

        return res.render('excusedpayment', { 
            user: req.user,
            debtorList,
            dataInfo,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')], 
        });
    }

    //find id
    try {
        debtorRef = await DebtorsDB.findOne({fileId: req.body.fileid})
        if(!debtorRef){ errors.push('Case not found'); }

        const similiarPayments = await PaymentDB.find({
            payment: 0,
            date: req.body.date, 
            caseID: debtorRef._id
        })

        if(similiarPayments.length > 0) errors.push(`We found an excused payment for the same date for this account.`); 

        //verify debt status
        if(verifyAccountStatus(debtorRef, await PaymentDB.find({caseID: debtorRef._id}))) errors.push(`This account does not have any deliquent payments`);


    } catch (error) {
        console.error(error.message);
        errors.push('An error occured with the database. #005');
    }

    //return errors
    if(errors.length) {
        req.flash('errors', errors);

        return res.render('excusedpayment', { 
            user: req.user, 
            debtorList,
            dataInfo,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')], 
        });
    }

    //construct data object
    const excusedPayment = new PaymentDB({
        caseID: debtorRef._id,
        payment: 0,
        date: req.body.date,
        comment: req.body.comment
    })

    //save to database
    excusedPayment.save((err) => { //NOTE:: Callback
        if(err){
            console.error(err._message)
            req.flash('errors', 'There was an error submitting the data to the database. #003');
            return res.render('excusedpayment', { 
                user: req.user, 
                debtorList,
                dataInfo, 
                messages: [...req.flash('msg')], 
                errors: [...req.flash('errors')], 
            });
        }

        req.flash('msg', 'Successfully saved.');
        res.render('excusedpayment', {
            user: req.user,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        })
    })
 
}

export async function editExcusedPayment(req, res){
    const errors = dataVerifier({ //validate user submitted info
        payment: req.body.payment,
        date: req.body.date,
        fileid: req.body.fileid,
        mongoId: req.body.id,
    })

    if(errors.length) {
        req.flash('errors', errors);
        return res.redirect(req.headers.referer);
    }

    
    try {
        //find id
        const debtorRef = await DebtorsDB.findOne({fileId: req.body.fileid})
        if(!debtorRef){ errors.push('Case not found'); }

        //find duplicates
        const similiarPayments = await PaymentDB.find({
            payment: 0,
            date: req.body.date, 
            caseID: debtorRef._id
        })

        if(similiarPayments.length > 0){ errors.push(`We found an excused payment for the same date for this account.`); }

        //return errors
        if(errors.length) {
            req.flash('errors', errors);
            return res.redirect(req.headers.referer);
        }

        //update database
        const excusedUpdated = await PaymentDB.updateOne({_id: req.body.id},{
            debtorRef: debtorRef._id,
            date: req.body.date,
            comment: req.body.comment
        })

        if(excusedUpdated.modifiedCount > 0){
            req.flash('msg', "updated successfully");
            res.redirect(`/cases/${req.body.fileid}`)
        }else{
            req.flash('errors', "Unable to update");
            return res.redirect(req.headers.referer);
        }

    } catch (error) {
        console.error(error.message);
        errors.push('An error occured with the database. #005');

        return res.redirect(req.headers.referer);
    }

}

export async function editPayment(req, res){
    const errors = dataVerifier({ //validate user submitted info
        payment: req.body.payment,
        date: req.body.date,
        fileid: req.body.fileid,
        mongoId: req.body.id,
    })

    if(errors.length) {
        req.flash('errors', errors);
        return res.redirect(req.headers.referer);
    }

    
    try {
        //find id
        const debtorRef = await DebtorsDB.findOne({fileId: req.body.fileid})
        if(!debtorRef){ errors.push('Case not found'); }

        let debtInfo = await DebtDB.findOne({_id: debtorRef._id})
        const paymentInfo = await PaymentDB.find({caseID: debtorRef._id})
        let paymentSum = paymentInfo.reduce((accumulator, currentValue) => accumulator + Number(currentValue.payment), 0 )
        let pendingBalance = debtInfo.debtAmount - paymentSum

        //find duplicates
        const similiarPayments = await PaymentDB.find({
            payment: req.body.payment, 
            date: req.body.date, 
            caseID: debtorRef._id
        })

        if(similiarPayments.length > 0){ errors.push(`We found a payment for the same amount and date for this account.`); }

        if(pendingBalance < req.body.payment){errors.push(`Can't add payment. Amount is more than the debt owed for this account. This account owes ${pendingBalance}`)}

        //return errors
        if(errors.length) {
            req.flash('errors', errors);
            return res.redirect(req.headers.referer);
        }

        //update database
        await PaymentDB.updateOne({_id: req.body.id},{
            debtorRef: debtorRef._id,
            payment: parseFloat(req.body.payment),
            date: req.body.date,
            comment: req.body.comment
        })

        res.redirect(`/cases/${req.body.fileid}`)

    } catch (error) {
        console.error(error.message);
        errors.push('An error occured with the database. #005');

        return res.redirect(req.headers.referer);
    }

}

export async function insertNewDebt(req, res){
    const pagevalues = {
        name: req.body.name,
        debtamount: req.body.debtamount,
        fileid: req.body.fileid,
        minpayment: req.body.minpayment,
        startdate: req.body.startdate,
    }
    //validate submitted info
    const errors = dataVerifier(pagevalues)

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('newdebt', { 
            user: req.user,
            pagevalues,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        });
    }

    //contruct data objects
    const newDebt = new DebtDB({
        debtAmount: parseFloat(req.body.debtamount),
        minPayment: parseFloat(req.body.minpayment),
        startDate: req.body.startdate,
    })

    const newDebtor = new DebtorsDB({
        name: req.body.name, 
        fileId: req.body.fileid,
    })

    //submit data to db
    newDebtor.save((err, savedDoc) => { //NOTE:: Callback
        if(err && err.code === 11000){
            console.error(err)
            req.flash('errors', 'The file id already exist, a person can not have two debts.');
            return res.render('newdebt', { 
                user: req.user,
                pagevalues,
                messages: [...req.flash('msg')], 
                errors: [...req.flash('errors')],
            });
        }else if(err){
            console.error(err)
            req.flash('errors', 'Error submitting data to database. #001');
            return res.render('newdebt', { 
                user: req.user,
                pagevalues,
                messages: [...req.flash('msg')], 
                errors: [...req.flash('errors')],
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
                        pagevalues,
                        messages: [...req.flash('msg')], 
                        errors: [...req.flash('errors')],
                    });
                }

                req.flash('msg', 'Debt Data saved successfully.');
                res.redirect(req.headers.referer);
                // return res.render('newdebt', { 
                //     user: req.user, 
                //     messages: [...req.flash('msg')], 
                //     errors: [...req.flash('errors')],
                // });
            })
        }
    })
}

export async function editDebt(req, res){
    const debtInfo = {
        name: req.body.name,
        debtamount: req.body.debtamount,
        fileid: req.body.fileid,
        minpayment: req.body.minpayment,
        startdate: req.body.startdate,
    }
    //validate submitted info
    const errors = dataVerifier(debtInfo)

    if(errors.length) {
        req.flash('errors', errors);
        return res.render('editdebtor', { 
            user: req.user,
            debtInfo,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        });
    }

    //contruct data objects
    const newDebt = {
        debtAmount: parseFloat(req.body.debtamount),
        minPayment: parseFloat(req.body.minpayment),
        startDate: req.body.startdate,
    }

    const newDebtor = {
        name: req.body.name, 
        fileId: req.body.fileid,
    }

    try {
        if(req.body.id !== req.body.fileid){
            const duplicateDebtor = await DebtorsDB.findOne({fileId: req.body.fileid})
            if(duplicateDebtor)  throw 'debtor file id already exists';
        }

        const updatedDebtor = await DebtorsDB.findOneAndUpdate({fileId: req.body.id}, newDebtor)
        if(!updatedDebtor)  throw 'debtor not found';
        
        const updatedDebt = await DebtDB.updateOne({_id: updatedDebtor._id}, newDebt)
        if(!updatedDebt.acknowledged || updatedDebt.modifiedCount < 0) throw 'debt not found';

        req.flash('msg', 'Data saved successfully.');
        res.redirect(`/cases/${req.body.fileid}`)

    } catch (error) {
        console.error(error)
        req.flash('errors', 'An error occurred:');
        if(error === 'debtor not found'){req.flash('errors', 'Debtor not found');}
        if(error === 'debt not found'){req.flash('errors', 'Debt not found');}
        if(error === 'debtor file id already exists'){req.flash('errors', 'The fileid already exists and must be unique');}
        if(error.codeName === 'DuplicateKey'){req.flash('errors', 'The fileid already exists and must be unique');}
        
        return res.render('editdebtor', { 
            user: req.user,
            debtInfo,
            messages: [...req.flash('msg')], 
            errors: [...req.flash('errors')],
        });
    }

}

export async function deletePayment(req, res){
    try {
        if(!req.params.id){
            req.flash('error', "No payment selected");
            return res.redirect(req.headers.referer);
        }
        
        const deleted = await PaymentDB.deleteOne({ _id: req.params.id })
        
        if(deleted.acknowledged){ 
            req.flash('msg', "Payment deleted"); 
        }else{
            req.flash('error', "Payment not deleted");
        }

        return res.redirect(req.headers.referer);
    } catch (error) {
        console.error(error)
        req.flash('error', "An error occurred #008");

        return res.redirect(req.headers.referer);
    }
}



//-----------------------------------------------------------------

function createListOfBills(startDate){
    const elapsed = monthElapsed(new Date(startDate))
    const billed = []

    //format bill date to the 1st
    let billDate = new Date(startDate)
        billDate.setDate(1)

    //adding bills
    for(let i = 0; i<elapsed; i++){
       billed.push({
            date: new Date(billDate.setMonth(billDate.getMonth()+1)).valueOf(),
        })
    }

    return billed
}

function removeCaseAndVersion(payments){
    let modifiedPayments = []

    for(let items of payments){
        modifiedPayments.push({
            id: items._id,
            date: items.date.setDate(items.date.getDate()+1), 
            payment: Number(items.payment),
            comment: items.comment,
        })
    }

    modifiedPayments.sort(function(a,b){
        return a.date - b.date;
    });

    return modifiedPayments
}

async function createDebtorInfo(fileIdentifier){
    const selectedDebtor = await DebtorsDB.findOne(fileIdentifier)

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
            id: selectedDebtor._id,
            name: selectedDebtor.name,
            fileId: selectedDebtor.fileId,
            startDate: debtForSelected.startDate.setDate(debtForSelected.startDate.getDate()+1),
            minPayment: Number(debtForSelected.minPayment),
            debt: debtForSelected.debtAmount,
        }

        return debtorInfo;
}

async function createTransactions(debtorData){

    let payments = await PaymentDB.find({caseID: debtorData.id}); //randomizedPayments(100, debtForSelected.startDate)
    payments = removeCaseAndVersion(payments)
    const bills = createListOfBills(debtorData.startDate);

    if(bills.length * debtorData.minPayment > debtorData.debt){
        let actualBills = Math.ceil(debtorData.debt/debtorData.minPayment)
        bills.splice(actualBills)
    }

    debtorData["transactions"] = [...payments, ...bills];
    debtorData.transactions.sort(function(a,b){
        return a.date - b.date;
    });

    return debtorData;
}

function calcMerge(debtorInfo){
    try {
        if(!debtorInfo.billed || !debtorInfo.payments){ return debtorInfo }

        //initializing bills and payments
        for(let bill of debtorInfo.billed){
            bill.space = 1
        }

        for(let payment of debtorInfo.payments){
            payment.space = 1
        }

        if(debtorInfo.payments.length <= 0) return debtorInfo

       //-----------------
       //calcuting space need for payment and bills
       let bill = 0
       let payment = 0
       let balance = -debtorInfo.minPayment + Number(debtorInfo.payments[payment].payment)

       let billContinue = () => {
           balance += Number(debtorInfo.payments[payment].payment)
       }
       let paymentContinue = () => {
           balance += -debtorInfo.minPayment
       }
       let zeroStart = () => {
           if(payment >= debtorInfo.payments.length) return
           balance = -debtorInfo.minPayment + Number(debtorInfo.payments[payment].payment)
       }
       let statusDoneProcessing = () => {
            if(payment < debtorInfo.payments.length-1 && bill < debtorInfo.billed.length){
                return true
            }

            if(balance > 0 && bill < debtorInfo.billed.length){
                return true
            }

            if(payment < debtorInfo.payments.length && bill < debtorInfo.billed.length){
                if(debtorInfo.payments[payment].payment === 0) return true
            }

            return false
       }

       while(statusDoneProcessing()){
            if(balance < 0 && debtorInfo.payments[payment].payment === 0){
                let paymentDate = new Date(debtorInfo.payments[payment].date)
                paymentDate = paymentDate.setMonth(paymentDate.getMonth()-1)
                
                if (paymentDate > debtorInfo.billed[bill].date) {
                    debtorInfo.payments[payment].space++ //payment continues
                    bill++ //bill ends
                } else {
                    balance = 0
                }
                continue
            }

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

        return debtorInfo

    } catch (error) {
        throw error 
        //req.flash('errors', 'An error occured with the database. #004');
        //return res.redirect(req.headers.referer);
    }
}

function calcPaidStatus(debtorInfo){
    let balance = 0;
    let billCounter = 0
    let paymentCounter = 0

    if(debtorInfo.payments.length === 0) balance = null
    
    //run as long as we have bills
    while(billCounter < debtorInfo.billed.length){ 
        //if the balance is 0
        if(balance === 0){
            //then use the current payment and subtract a bill
            balance = debtorInfo.payments[paymentCounter].payment - debtorInfo.minPayment

            //if the balance is now positive or still 0
            if(balance >= 0){ 
                //the bill is marked as paid and we move to the next bill
                debtorInfo.billed[billCounter].payment = "paid"
                billCounter++
            }
            //if the current payment is not an excused payment we move to the next payment
            if(debtorInfo.payments[paymentCounter].payment !== 0) {
                paymentCounter++
            }
        }else if(balance < 0 || balance === null){ //if balance is a negative number
            //if we still have more payments
            if(paymentCounter < debtorInfo.payments.length){ 
                //if current paymenttt is an excused payment
                if(debtorInfo.payments[paymentCounter].payment === 0) {
                    //if the date of the excused payment is bigger then the current owed bill
                    if (debtorInfo.payments[paymentCounter].date > debtorInfo.billed[billCounter].date) {
                        //mark the bill as excused and move to the next bill
                        debtorInfo.billed[billCounter].payment = "excused"
                        billCounter++
                    }else{
                        //if not bigger then move to the next payment, no more bills are excused with this payment
                        paymentCounter++
                    }
                }else{
                    //if not an excused payment then add the current payment to the owed balance
                    balance += debtorInfo.payments[paymentCounter].payment
                    //if balance is not positive or zero
                    if(balance >= 0){
                        //mark bill as paid and move to the next bill
                        debtorInfo.billed[billCounter].payment = "paid"
                        billCounter++
                    }
                    //move to the next payment since a current bill is still due
                    paymentCounter++
                }
            }else{//if we have no more payments
                //then the current payment is equal to

                if(balance == null){
                    debtorInfo.billed[billCounter].payment = -debtorInfo.minPayment
                    billCounter++
                    balance -=debtorInfo.minPayment
                }else{
                    debtorInfo.billed[billCounter].payment = Math.abs(balance) < debtorInfo.minPayment ? balance : -debtorInfo.minPayment
                    billCounter++
                    balance -=debtorInfo.minPayment
                }
            }
        }else if(balance > 0){ //if balance is positive
            //subtract current bill from balance
            balance -= debtorInfo.minPayment
            //if balance is still positive or 0
            if(balance >= 0){
                //mark bill as paid move to next bill
                debtorInfo.billed[billCounter].payment = "paid"
                billCounter++
            }
        }
    }

    return debtorInfo;
}

function verifyAccountStatus(debtInfo, paymentInfo){
    let paidAmount = 0
    let excusedDate = debtInfo.startDate

    for(let payments of paymentInfo){
        if(payments.payment > 0){
            paidAmount += Number(payments.payment)
        }else if(payments.payment !== undefined){
            paidAmount = 0
            if(payments.date > excusedDate) excusedDate = payments.date
        }
    }

    const currentBills = monthElapsed(new Date(excusedDate)) * debtInfo.minPayment

    if(currentBills > paidAmount){
        return true
    }else{
        return false
    }
}

//-------------------------------------------------------------------------

function buildList(debtorInfo, debtInfo, paymentInfo){
    const tempList = {}
    const newList = []

    for(let items of debtorInfo){
        console.log( items.name)
        tempList[items._id] = {}
        tempList[items._id]['name'] = items.name
        tempList[items._id]['fileid'] = items.fileId
        tempList[items._id]['payments'] = 0
        tempList[items._id]['allpayments'] = []
    }

    for(let items of paymentInfo){
        
        tempList[items.caseID]['payments'] += Number(items.payment)
        tempList[items.caseID]['allpayments'].push(items)
    }

    for(let items of debtInfo){
        let owed = "late"
        if(tempList[items._id]['allpayments']){
            owed = verifyAccountStatus(items, tempList[items._id]['allpayments'])
        }

        newList.push({ 
            name: tempList[items._id]['name'],
            fileId: tempList[items._id]['fileid'],
            currentDebt: items.debtAmount - tempList[items._id]['payments'],
            minPayment: items.minPayment,
            paymentLate: owed,
        })
    }

    return newList;
}

function monthElapsed(endDate, starterDater = new Date()) {
    let months;
    months = (starterDater.getFullYear() - endDate.getFullYear()) * 12;
    months -= endDate.getUTCMonth();
    months += starterDater.getUTCMonth();

    return months <= 0 ? 0 : months;
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
        console.log(data.startdate)
        if(!validator.isLength(data.startdate, {min: 1})){
            errors.push('Start date cannot be empty');
        } else if(!validator.isDate(data.startdate)){
            errors.push('Start Date can only be a valid date format, dd/mm/yyyy.');
        }
    }

    if(data.payment !== undefined){
        if(!validator.isLength(data.payment, {min: 1}) || data.payment == 0){
            errors.push('Payment cannot be empty or 0');
        }else if(!validator.isCurrency(data.payment, {require_symbol: false, allow_negatives: false})){
            errors.push( 'Payment can only be a valid positive currency format (###.##))');
        }
    }

    if(data.date !== undefined){
        if(!validator.isLength(data.date, {min: 1})){
            errors.push('Date cannot be empty');
        }else if(!validator.isDate(data.date)){
            errors.push('Date can only be a valid date format, dd/mm/yyyy.');
        }else if(validator.isAfter(data.date)){
            errors.push('Date can not be after todays date.');
        }
    }

    if(data.comment !== undefined && data.payment === undefined){
        if(!validator.isLength(data.comment, {min: 8})){
            errors.push('An reason must be present for excused payments.');
        }
    }

    if(data.mongoId !== undefined){
        if(!validator.isMongoId(data.mongoId)){
            errors.push('Not a valid database id');
        }
    }
    
    return errors
}