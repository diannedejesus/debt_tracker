import mongoose from 'mongoose'

const VerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,// this is the expiry time | 86400000 =1day
  },
})

export default mongoose.model('Verification', VerificationSchema)
