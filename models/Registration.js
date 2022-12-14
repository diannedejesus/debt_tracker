import mongoose from 'mongoose'

const VerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 10800,// 3hr this is the expiry time | 86400 = 1day
  },
})

export default mongoose.model('Verification', VerificationSchema)
