import mongoose from 'mongoose'

const DebtSchema = new mongoose.Schema({
  debtAmount: {
    type: Number,
    required: true,
    set: convertFromCurrency,
    get: convertToCurrency,
  },

  minPayment: {
    type: Number,
    required: true,
    set: convertFromCurrency,
    get: convertToCurrency,
  },

  startDate: {
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


export default mongoose.model('Debt', DebtSchema)
