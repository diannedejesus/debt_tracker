import DebtDB from '../models/Debts.js';
import DebtorsDB from '../models/Debtors.js';
import '../controllers/mainCNTLR.js'



export function randomizedPayments(maxPayment, startDate){
    const paymentAmounts = Math.floor(Math.random() * 15);
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

//debtor: name / id / start / payment / debt / payments [date, payment, comment]
//need to also include options for excused payments

function createPayments(){
    //name: Random Person
    //fileId: 404

    const today = new Date()
    const startDate = randomDate(today.setFullYear(today.getFullYear()-5), today)
    const totalMonths = monthElapsed(startDate) + 2
    const totalPayments =  Math.floor(Math.random() * totalMonths)
    const minPayment = Math.floor(Math.random() * 100)
    const debtAmount = Math.floor(Math.random() * 5000)
    const randomizedPayments = []

    while(randomizedPayments.length < totalPayments && totalPaid < debtAmount){
        let currentPay = Math.floor(Math.random() * (minPayment * 2))
        totalPaid += currentPay

        randomizedPayments.push({
            date: randomDate(startDate, new Date()),
            payment: currentPay,
            comment: '',
        })
    }

    //test for randomuser
    //if true update
    //if not insert
    
    const randomDebtor = {
        name: "Random Person",
        fileId: "404",
    }

    const randomDebt = {
        debtAmount,
        minPayment,
        startDate,
    }

    //payments

    
}
//payments
    //amount of payment
    //amount of each payment

//debt

//date

//temp save of generated data in database
//this gets added to list
//only one?
//showing of scenarios
//button to create new random




function randomizedPaymentsZero(maxPayment, startDate){
    const paymentAmounts = Math.floor(Math.random() * 4);
    const randomPayments = []
    let totalPaid = 0

    while(randomPayments.length < paymentAmounts && totalPaid < maxPayment){
        let currentPay = Math.floor(Math.random() * 20)
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
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function monthElapsed(endDate, starterDater = new Date()) {
    let months;
    months = (starterDater.getFullYear() - endDate.getFullYear()) * 12;
    months -= endDate.getMonth();
    months += starterDater.getMonth();
    return months <= 0 ? 0 : months;
}


//-----------------DEMO-----------------------------------

export function demoDebtor(req, res){
    const generatedData = baseCase()

    req.body = {
        name: generatedData.name,
        debtamount: generatedData.debtAmount,
        fileid: generatedData.fileId,
        minpayment: generatedData.minPayment,
        startdate: generatedData.startDate,
    }

    insertNewDebt(req, res)
}

export async function demoPayments(req, res){
    const debt = await DebtDB.findOne({fileId: req.body.fileid})
    const paymentRange = debt.minPayment * 2.3
    const paymentQuantity = monthElapsed(debt.startDate)

    const generatedData = randomPayments(paymentRange, debt.startDate, paymentQuantity, debt.debt)

    for(let i=0; i<generatedData.length; i++){
        req.body = {
            fileid: req.body.fileid,
            payment: generatedData[i].payment,
            date: generatedData[i].date,
            comment: generatedData[i].comment,
        }
    
        await insertNewPayment(req, res)
    }
}


function baseCase(){
    const today = new Date()

    let basicCase = {
        debtor: "Random Person", //https://generatorfun.com/funny-name-generator
        fileId: `${Math.floor(Math.random() * 500)}-${String.fromCharCode(Math.floor(Math.random() * 25))}`,
        debtAmount: Math.floor(25 + Math.random() * 5000),
        minPayment: Math.floor(1 + Math.random() * 150),
        startDate: randomDate(today.setFullYear(today.getFullYear()-20), today)
    }

    if(basicCase.debtAmount < basicCase.minPayment){
        minPayment: Math.floor(1 + Math.random() * basicCase.debtAmount)
    }

    return basicCase;
}

function randomPayments(paymentTotal, startDate, paymentQuantity, debtTotal){
    const paymentAmounts = Math.floor(Math.random() * paymentQuantity) //
    const randomPayments = []
    let totalPaid = 0

    while(randomPayments.length < paymentAmounts && totalPaid < debtTotal){
        let currentPay = Math.floor(Math.random() * paymentTotal)
        totalPaid += currentPay

        randomPayments.push({
            date: randomDate(startDate, new Date()),
            payment: currentPay,
            comment: '', //https://api.chucknorris.io/
        })
    }

    return randomPayments;
}