const express=require('express');
const router=express.Router();
const passengerController=require("../controller/passengerController")
router.post("/get-all-cabs",passengerController.getAllCabs);
router.post("/notify-nearby-drivers",passengerController.notifyAllDivers);
module.exports=router;