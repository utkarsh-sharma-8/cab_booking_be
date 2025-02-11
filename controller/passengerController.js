const driverModel = require("../models/driverModel");

const getAllCabs=async(req,res)=>{
    const {latitude,longitude}=req.body;
    if(!latitude || !longitude){
        return res.status(400).json({error:"Latitude And Longitude Are Required!"});
    }    

    try{
        const nearByDrivers=await driverModel.find({
            location:{
                $near: {
                    $geometry:{type: "Point",coordinates:[longitude,latitude]},
                    $maxDistance:3000,
                    $minDistance:0,
                }
            },isAvailable:true,
        });

        res.status(200).json({success:true,data:nearByDrivers});
    }catch(error){
        res.status(500).json({success:false,error:error.message});
    }
}
const notifyAllDivers=async(req,res)=>{
    const {passengerId,latitude,longitude,source,destination}= req.body;
    if(!latitude || !longitude || !passengerId ||!source || !destination){
        console.log("Req Body is not complete");
    }
    try{
        const nearByDrivers=await driverModel.find({
            location:{
                $near: {
                    $geometry:{type: "Point",coordinates:[longitude,latitude]},
                    $maxDistance:3000,
                    $minDistance:0,
                }
            },
            isAvailable:true,
        });
        if(nearByDrivers.length===null){
            res.status(404).json({message:"Drivers Not Available Right Now"});
        }
        const io=req.app.get("io");
        nearByDrivers.forEach((driver) => {
            io.to(driver.socketId).emit("rideRequest", {
                passengerId,
                source,
                destination,
                pickupLocation: { latitude, longitude }
            });
        });
        
        res.status(200).json({ message: "Ride request sent to nearby drivers!" });
    }catch(error){
        res.status(500).json({success:false,error:error.message});
    }
    
}
module.exports={ getAllCabs, notifyAllDivers};