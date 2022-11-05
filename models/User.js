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
  accountType: {
    type: String, 
    enum: ["Case Worker", "Owner", "App Manager"]
  },
  revoked: {
    type: Boolean,
    required: false,
    default: false,
  },
})

export default mongoose.model('User', UserSchema)
