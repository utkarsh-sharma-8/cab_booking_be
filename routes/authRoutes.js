const express = require("express");
const router =express.Router();
const authController=require("../controller/authController");
router.post("/auth",authController.auth);
module.exports=router;