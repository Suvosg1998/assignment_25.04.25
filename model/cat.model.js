const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    PId:{
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('cat', catSchema);