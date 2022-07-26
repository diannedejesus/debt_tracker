const mongoose = require('mongoose')

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
  registered: {
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

module.exports = mongoose.model('User', UserSchema)
