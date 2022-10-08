import mongoose from 'mongoose';
import crypto from 'node:crypto';
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const algorithm = "aes-256-cbc";
const initVector = process.env.initVector//16 bytes of random data
const Securitykey = process.env.SKEY //32 bytes of random data

const DebtorSchema = new mongoose.Schema({
  debtorID: {
    type: String,
    required: true,
  },

  name: {
    type: String,
    required: true,
    set: encryptData,
    get: decryptData,
  },

  fileId: {
    type: String,
    required: true,
    unique: true,
    set: encryptData,
    get: decryptData,
  },
})

// Getter
function decryptData(item){ 
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);

  if(item){
    let decryptedData = decipher.update(item, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
  }
  return item;
}

// Setter
function encryptData(item){
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);
  let encryptedData = cipher.update(item, "utf-8", "hex");
  encryptedData += cipher.final("hex");

  return encryptedData;
}

export default mongoose.model('Debtor', DebtorSchema)
