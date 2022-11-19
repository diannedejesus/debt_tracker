import DebtDB from '../models/Debts.js';
import DebtorsDB from '../models/Debtors.js';



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

export async function getTestCaseInfoMerge(req, res){
    const debtorsList =  await DebtorsDB.find().select("name fileId")
    let caseFileId = {fileId: req.params.id}

    if(!caseFileId.fileId){
        req.flash('errors', 'No file id sent');
        return res.redirect(req.headers.referer);
    }

    try {
        const debtorInfo = await buildTestInfoMerge(caseFileId)

        res.render('individualcase-merge-view', {
            user: req.user,
            debtorInfo,
            debtorsList,
            messages: [...req.flash('errors'), ...req.flash('msg')]
        })

    } catch (error) {
        console.error(error);
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
            minPayment: debtForSelected.minPayment,
            debt: debtForSelected.debtAmount,
            elapsed: monthElapsed(new Date(debtForSelected.startDate)),
            totalPaid: 0,
            payments: [],
            billed: [],
        }

        const payments = randomizedPayments(debtorInfo.debt, new Date(debtorInfo.startDate))
        console.log(payments)
        
        //prep date
        let owedPaymentsDate = new Date(debtorInfo.startDate)
            owedPaymentsDate.setDate(1)

        //adding payments due 
        for(let i = 0; i<debtorInfo.elapsed; i++){
            debtorInfo.billed.push({
                paymentDate: new Date(owedPaymentsDate.setMonth(owedPaymentsDate.getMonth()+1)),
                paymentAmount: debtForSelected.minPayment,
                space: 0,
            })
        }

        if(!payments){ return debtorInfo }

        for(let items of payments){
            debtorInfo['totalPaid'] += Number(items.payment)

            debtorInfo.payments.push({
                paymentDate: items.date.setDate(items.date.getDate()+1),
                paymentAmount: Number(items.payment),
                paymentComment: items.comment,
                space: 0,
            })
        }

        debtorInfo.payments.sort(function(a,b){
            return a.paymentDate - b.paymentDate;
        });

console.log(debtorInfo)

        return debtorInfo

    } catch (error) {
        throw error 
        //req.flash('errors', 'An error occured with the database. #004');
        //return res.redirect(req.headers.referer);
    }
}

async function buildTestInfoMerge(caseFileId){
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

//-------------------------------------------
        //only for static data
        // for(let payments of debtorInfo.payments){
        //     let currentPay = payments.paymentAmount
        //     debtorInfo['totalPaid'] += currentPay
        // }
//-----------------------------------------------

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
            if(payment >= debtorInfo.payments.length) return
            balance = -debtorInfo.minPayment + debtorInfo.payments[payment].paymentAmount
        }

       
        while((balance > 0 || payment < debtorInfo.payments.length-1) && bill < debtorInfo.billed.length){
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

export function randomizedPayments(maxPayment, startDate){
    const paymentAmounts = Math.floor(Math.random() * 30);
    const randomPayments = []
    let totalPaid = 0

    while(randomPayments.length < paymentAmounts && totalPaid < 2000){
        let currentPay = Math.floor(Math.random() * maxPayment)
        totalPaid += currentPay

        randomPayments.push({
            date: randomDate(startDate, new Date()),
            payment: currentPay,
            comment: '',
            space: 0,
        })
    }
     
    return randomPayments
}

function randomizedPaymentsZero(maxPayment, startDate){
    const paymentAmounts = Math.floor(Math.random() * 15);
    const randomPayments = []
    let totalPaid = 0

    while(randomPayments.length < paymentAmounts && totalPaid < maxPayment){
        let currentPay = Math.floor(Math.random() * 30)
        totalPaid += currentPay

        randomPayments.push({
            date: randomDate(startDate, new Date()),
            payment: currentPay,
            comment: '',
            space: 0,
        })
    }

    //first case 0 test
    randomPayments[0].payment = 0
    
    return randomPayments
}


function randomDate(start, end){
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function monthElapsed(endDate, starterDater = new Date()) {
    let months;
    months = (starterDater.getFullYear() - endDate.getFullYear()) * 12;
    months -= endDate.getMonth();
    months += starterDater.getMonth();
    return months <= 0 ? 0 : months;
}