const express = require("express");
const router=express.Router();
const { verifyToken }=require("../middleware/verifyToken")
const driverController=require("../controller/driverController");
router.post('/add-driver',driverController.addDriver);
module.exports=router;