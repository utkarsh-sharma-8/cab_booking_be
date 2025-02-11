const driverModel = require("../models/driverModel");
let activeRides = {}; // Store active ride assignments
let connectedDrivers = {}; // Store connected drivers
let connectedPassenger={};
const setupWebSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`🚖 Driver Connected: ${socket.id}`);

        // Register Driver for Live Updates
        socket.on("register_driver", async (data) => {
            const { phone } = data;
            connectedDrivers[phone] = socket.id;
            console.log(`✅ Driver ${phone} registered for live updates`);

            // Update driver in DB with socket ID
            await driverModel.findOneAndUpdate({ phone }, { socketId: socket.id });
        });

        // Update Driver Location
        socket.on("location_update", async (data) => {
            const { phone, latitude, longitude } = data;

            await driverModel.findOneAndUpdate(
                { phone },
                { location: { type: "Point", coordinates: [longitude, latitude] } }
            );

            console.log(`📍 Location updated for driver ${phone}: ${latitude}, ${longitude}`);

            // Notify all connected clients about location update
            io.emit("driver_location", { phone, latitude, longitude });
        });

        // Driver Accepts Ride
        socket.on("acceptRide", async (data) => {
            const { driverId, passengerId } = data;

            if (activeRides[passengerId]) {
                return socket.emit("rideTaken", { message: "❌ Ride already accepted by another driver!" });
            }

            // Assign ride to the first driver who accepts
            activeRides[passengerId] = driverId;
            const passengerSocketId=connectedPassenger[passengerId];
            const driverSocketId=connectedDrivers[driverId];
            if(passengerSocketId){
                io.to(passengerSocketId).emit("rideAccepted",{
                    driverId,
                    driverScocketId,
                    message:"Your Ride Has Been Accepted"
                })
            }
            if(driverSocketId){
                io.to(driverSocketId).emit("ride Assigned",{
                    passengerId,
                    passengerSocketId,
                    message:"Passenger Connected To You"
                })
            }

            console.log(`✅ Driver ${driverId} accepted ride for Passenger ${passengerId}`);
        });
        socket.on("Send Message",(data)=>{
            const {senderId,recieverId,message}=data
            const recieverSocketId = connectedDrivers[recieverId] || connectedPassenger[recieverId];
            if(recieverSocketId){
                io.to(recieverSocketId).emit("recieveMessage",{senderId,message})
            }
        })
        // Handle Driver Disconnect
        socket.on("disconnect", async () => {
            const driverPhone = Object.keys(connectedDrivers).find(
                (phone) => connectedDrivers[phone] === socket.id
            );

            if (driverPhone) {
                await driverModel.findOneAndUpdate({ phone: driverPhone }, { isAvailable: false });
                delete connectedDrivers[driverPhone];
                console.log(`❌ Driver ${driverPhone} Disconnected`);
            }
        });
    });
};

module.exports = { setupWebSocket };
