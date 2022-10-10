import mongoose from 'mongoose'

const PaymentLogSchema = new mongoose.Schema({
  caseID: {
    type: mongoose.ObjectId,
    required: true,
  },

  payment: {
    type: Number,
    required: true,
    set: convertFromCurrency,
    get: convertToCurrency,
  },

  date: {
    type: Date,
    required: true,
  },
})

// Getter
function convertToCurrency(num){
  return (num / 100).toFixed(2);
}

// Setter
function convertFromCurrency(num){
  return num * 100;
}


export default mongoose.model('PaymentLog', PaymentLogSchema)
