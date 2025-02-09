require("dotenv").config(); // Load environment variables
const SECRET_KEY=process.env.SECRET_KEY
const jwt= require("jsonwebtoken");

const generateToken=(phone)=>{
    return jwt.sign({phone},SECRET_KEY,{expiresIn:'1y'});
}

module.exports={ generateToken };