const { generateToken } = require("../utils/jwt");
const userModel = require("../models/userModel");
const { v4: uuidv4 } = require('uuid');

const auth=async(req,res)=>{
    const {phone,name}=req.body;
    if(!phone){
        return res.status(400).json({message:"Phone Is Required"});
    }
    if(!name){
        return res.status(400).json({message:"Name Is Required"});
    }
    try{
        const user=await userModel.findOne({phone:phone});
        console.log(user);
        const token = generateToken(phone);
        if(user){
            res.status(200).json({messsage:"Success",user,token});
        }else{
            const result=await userModel.create({phone,name,passengerId:uuidv4()});
            res.status(201).json({message:"User Created Successfully",result,token})
        }
    }catch(error){
        console.log(`Error is ${error}`);
        return res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
}

module.exports={ auth };