

const mongoose = require('mongoose');
const mongooseIntl = require('mongoose-intl');

const Schema = mongoose.Schema

const UserCollecitonName =  'coh_user'
const UserSchema = Schema({ 
    account:{
        type:String,
        required:true,
    }, 
    avatar: String,
    email: String,
    dob: Date,
    steamId: String,
    deviceId: String,
    socialId: String
}, {
    toJSON: {
        virtuals: true,
    },
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }});
 
module.exports = {
    UserModel: mongoose.model(UserCollecitonName,UserSchema),
    UserCollecitonName: UserCollecitonName
}