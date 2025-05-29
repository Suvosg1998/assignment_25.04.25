const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    photo:{
        type:String,
        default:''
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cat',
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true,versionKey:false});
productSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('Prod',productSchema);