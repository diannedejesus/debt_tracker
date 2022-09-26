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
})

export default mongoose.model('Verification', VerificationSchema)
