const express =require("express");
const app=express();
const http = require("http");
const morgan=require("morgan");
const authRoutes=require("./routes/authRoutes");
const driverRoutes=require("./routes/driverRoutes")
const passengerRoutes=require("./routes/passengerRoutes")
const mongoose=require('mongoose');
const {setupWebSocket} = require("./services/sockets");
const socketIo=require("socket.io")
app.use(express.json());
app.use(morgan('combined'));
const server = http.createServer(app);
const io = socketIo(server);
mongoose.connect(`mongodb://localhost:27017/users`)
.then(()=>{
    console.log(`MongoDB connected`);
}).catch((error)=>{
    console.log(`Error for MongoDB login is ${error.message}`);
});
app.use('/api',authRoutes);
app.use('/api',driverRoutes);
app.use('/api',passengerRoutes);
app.set("io", io); // Make io available in controllers
setupWebSocket(io);
const PORT=3000;
server.listen(PORT,()=>{
    console.log(`Server is Running On PORT ${PORT}`);
})