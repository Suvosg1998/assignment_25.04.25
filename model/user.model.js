const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    photo: {
        type: String,
        required: true
    },
    otp:{
        type: Number,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
}, { timestamps: true, versionKey: false });
// generating a hash
userSchema.methods.generateHash = async (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };
  // checking matching password
  userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


module.exports = mongoose.model('user', userSchema);
    