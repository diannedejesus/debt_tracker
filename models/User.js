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
  appManager: {
    type: Boolean,
    required: false,
    default: false,
  },
  owner: {
    type: Boolean,
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
