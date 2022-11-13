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

        
        //date
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

        const paymentAmounts = Math.floor(Math.random() * 15);

        while(debtorInfo.payments.length < paymentAmounts && debtorInfo['totalPaid'] < debtorInfo.debt){
            let currentPay = Math.floor(Math.random() * 30)
            
            debtorInfo['totalPaid'] += currentPay

            debtorInfo.payments.push({
                paymentDate: randomDate(debtForSelected.startDate, new Date()), 
                paymentAmount: currentPay,
                paymentComment: '',
                space: 0,
            })
        }

        debtorInfo.payments.sort(function(a,b){
            return a.paymentDate - b.paymentDate;
          });

        //   first case 0 test
        //   debtorInfo['totalPaid'] -= debtorInfo.payments[0].paymentAmount
        //   debtorInfo.payments[0].paymentAmount = 0

        // let totalPaid = debtorInfo.totalPaid
        // for(let items of debtorInfo.billed){
        //     if(totalPaid >= debtorInfo.minPayment){
        //         items.paymentAmount = "paid"
        //         totalPaid -= debtorInfo.minPayment
        //     }else if(totalPaid >= 0){
        //         items.paymentAmount = totalPaid - debtorInfo.minPayment
        //         totalPaid = 0
        //     }
        // }

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

function monthElapsed(endDate, starterDater = new Date()) {
    let months;
    months = (starterDater.getFullYear() - endDate.getFullYear()) * 12;
    months -= endDate.getMonth();
    months += starterDater.getMonth();
    return months <= 0 ? 0 : months;
}