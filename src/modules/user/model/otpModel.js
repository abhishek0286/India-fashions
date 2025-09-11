const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email : {
        type : String,
        default : ""
    },
    otpValue : {
        type : String,
        default : ""
    }, 
   otpExpiry: {
        type: Date, // must be a Date for TTL
        required: true,
        index: { expires: 0 } // TTL index (expire exactly at this date)
    }
},{timestamps : true});

const otpModel = mongoose.model("OTP", otpSchema);

module.exports = otpModel;