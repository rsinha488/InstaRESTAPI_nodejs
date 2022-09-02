const mongoose = require('mongoose');
var AutoIncrement = require('mongoose-sequence')(mongoose);

userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String },
    user_id: { type: Number },
    password: { type: String, required: true },
    email_id: { type: String, unique: true },
    user_name: { type: String, unique: true },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'other']
    },
    mobile: { type: Number },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    block: {
        type: Array,
        default: []
    },
    blockedBy:{
        type:Array,
        default:[]
    }
    // userType:{type:String}//Admin-user
    // account_type: { type: String } //Public, private

    //     name, 
    // user_id(auto increment integer number), 
    // Password (minimum 8 character, first char capital, alphanumeric, use of special char)
    // email_id(unique, validation for proper email format)
    // User_name (unique)
    // Gender (male/female/other)
    // Mobile (mobile number validation, with country code)

},
    { timestamps: true }
);
userSchema.plugin(AutoIncrement, { inc_field: 'user_id' });
module.exports = mongoose.model('user', userSchema);