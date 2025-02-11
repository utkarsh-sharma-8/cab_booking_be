const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    phone: {type:String,required:true,unique:true,index:true},
    name:{type:String,required:true},
    isDriver:{type:Boolean},
    passengerId:{type:Boolean},
},{timestamps:true})

module.exports =mongoose.model("User",userSchema);