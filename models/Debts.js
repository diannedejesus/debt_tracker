import mongoose from 'mongoose'

const DebtSchema = new mongoose.Schema({
  debtorID: {
    type: String,
    required: true,
  },

  debtAmount: {
    type: Number,
    required: true,
  },

  minPayment: {
    type: Number,
    required: true,
  },
  
  startDate: {
    type: Date,
    required: true,
  },
})

// Getter
DebtSchema.path('debtAmount').get(function(num) {
  return (num / 100).toFixed(2);
});
DebtSchema.path('minPayment').get(function(num) {
  return (num / 100).toFixed(2);
});

// Setter
DebtSchema.path('debtAmount').set(function(num) {
  return num * 100;
});
DebtSchema.path('minPayment').set(function(num) {
  return num * 100;
});


export default mongoose.model('Debt', DebtSchema)
