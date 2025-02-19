const mongoose=require("mongoose");

const driverSchema=new mongoose.Schema({
    phone: {type:String,required:true,unique:true},
    name:{type:String,required:true},
    car_no:{type:String,required:true},
    isAvailable:{type:Boolean},
    // location: {
    //     type: { type: String, default: "Point"},
    //     coordinates: { type: [Number]} // [longitude, latitude]
    // }
},{timestamps:true})
// driverSchema.index({ location: "2dsphere" }); // Add geospatial index
module.exports =mongoose.model("Driver",driverSchema);