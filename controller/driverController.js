const driverModel = require("../models/driverModel")
const userModel = require("../models/userModel")
const addDriver=async(req,res)=>{
    const {phone,car_no,name}=req.body;
    if(!car_no){
        return res.status(400).json({message:"car_no is required"});
    }
    try{
        const result = await driverModel.create({phone:phone,name:name,car_no:car_no})
        await userModel.updateOne({phone},{$set:{isDriver:true}});
        res.status(201).json({message:"Driver Added",result});
    }catch(error){
        console.log(`Error in Driver Controller ${error}`);
        res.status(500).json({error:"Internal Server Error"});
    }
}
module.exports={ addDriver };