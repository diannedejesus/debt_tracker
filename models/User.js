const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('User', UserSchema)
