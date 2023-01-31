import DebtDB from '../models/Debts.js';
import DebtorsDB from '../models/Debtors.js';



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
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function monthElapsed(endDate, starterDater = new Date()) {
    let months;
    months = (starterDater.getFullYear() - endDate.getFullYear()) * 12;
    months -= endDate.getMonth();
    months += starterDater.getMonth();
    return months <= 0 ? 0 : months;
}