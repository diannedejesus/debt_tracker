import mongoose from 'mongoose'

const changeLogSchema = new mongoose.Schema({
  details: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  user: {
    type: string,
    required: true,
  },
})

export default mongoose.model('changeLog', changeLogSchema)
