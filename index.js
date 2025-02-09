const express =require("express");
const app=express();
const morgan=require("morgan");
const authRoutes=require("./routes/authRoutes");
const mongoose=require('mongoose')
app.use(express.json());
app.use(morgan('combined'));

mongoose.connect(`mongodb://localhost:27017/users`)
.then(()=>{
    console.log(`MongoDB connected`);
}).catch((error)=>{
    console.log(`Error for MongoDB login is ${error.message}`);
});
app.use('/api',authRoutes);

const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server is Running On PORT ${PORT}`);
})