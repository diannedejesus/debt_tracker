import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    required: false,
    default: false,
  },
  tempPassword: {
    type: String,
    required: false,
    default: false,
  },
  revoked: {
    type: Boolean,
    required: false,
    default: false,
  },
})

export default mongoose.model('User', UserSchema)
