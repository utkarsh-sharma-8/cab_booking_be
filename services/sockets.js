// const driverModel = require("../models/driverModel");
// let activeRides = {}; // Store active ride assignments
// let connectedDrivers = {}; // Store connected drivers
// let connectedPassengers={};
// const setupWebSocket = (io) => {
//     io.on("connection", (socket) => {
//         console.log(`🚖 Driver Connected to socket id : ${socket.id}`);

//         // Register Driver for Live Updates
//         socket.on("register_driver", async (data) => {
//             const { phone } = data;
//             connectedDrivers[phone] = socket.id;
//             console.log(`✅ Driver ${phone} registered for live updates`);

//             // Update driver in DB with socket ID
//             await driverModel.findOneAndUpdate({ phone }, { socketId: socket.id });
//         });

//         // Update Driver Location
//         socket.on("location_update", (data) => {
//             const { phone, latitude, longitude } = data;

//             // ✅ Update driver's location in memory (NOT in DB)
//             if (connectedDrivers[phone]) {
//                 connectedDrivers[phone].location = { latitude, longitude };
//             }

//             console.log(`📍 Driver ${phone} location updated: ${latitude}, ${longitude}`);

//             // 📢 Broadcast location **only to passengers**
//             Object.values(connectedPassengers).forEach((passenger) => {
//                 io.to(passenger.socketId).emit("driver_location", { phone, latitude, longitude });
//             });
//         });
//         // socket.on("requestRide", async (data) => {
//         //     const { passengerId, latitude, longitude } = data;

//         //     // Find the nearest available driver (MongoDB Geospatial Query)
//         //     const nearestDriver = await driverModel.findOne({
//         //         isAvailable: true,
//         //         location: {
//         //             $near: {
//         //                 $geometry: { type: "Point", coordinates: [longitude, latitude] },
//         //                 $maxDistance: 5000 // 5km radius
//         //             }
//         //         }
//         //     });

//         //     if (!nearestDriver) {
//         //         return socket.emit("noDriversAvailable", { message: "❌ No drivers nearby. Try again later." });
//         //     }

//         //     // Notify the driver about the ride request
//         //     const driverSocketId = connectedDrivers[nearestDriver.phone];
//         //     if (driverSocketId) {
//         //         io.to(driverSocketId).emit("rideRequest", {
//         //             passengerId,
//         //             passengerSocketId: socket.id,
//         //             pickupLocation: { latitude, longitude },
//         //             message: "🚖 New Ride Request!"
//         //         });

//         //         // Store ride request
//         //         activeRides[passengerId] = nearestDriver.phone;

//         //         console.log(`📢 Ride request sent to Driver ${nearestDriver.phone} for Passenger ${passengerId}`);
//         //     } else {
//         //         socket.emit("noDriversAvailable", { message: "❌ Driver found but not online." });
//         //     }
//         // });
//         socket.on("requestRide", async (data) => {
//             const { passengerId, source, destination } = data;
        
//             // Validate input
//             if (!source || !source.latitude || !source.longitude || isNaN(source.latitude) || isNaN(source.longitude)) {
//                 console.log("❌ Invalid ride request: Missing source coordinates.");
//                 return socket.emit("invalidLocation", { message: "❌ Invalid pickup location." });
//             }
        
//             if (!destination || !destination.latitude || !destination.longitude || isNaN(destination.latitude) || isNaN(destination.longitude)) {
//                 console.log("❌ Invalid ride request: Missing destination coordinates.");
//                 return socket.emit("invalidLocation", { message: "❌ Invalid destination location." });
//             }
        
//             console.log(`🔍 Searching for drivers near pickup: ${source.latitude}, ${source.longitude}`);
        
//             // Find the nearest available driver
//             const nearestDriver = await driverModel.findOne({
//                 isAvailable: true,
//                 location: {
//                     $near: {
//                         $geometry: { type: "Point", coordinates: [source.longitude, source.latitude] },
//                         $maxDistance: 5000 // 5km radius
//                     }
//                 }
//             });
        
//             if (!nearestDriver) {
//                 return socket.emit("noDriversAvailable", { message: "❌ No drivers nearby. Try again later." });
//             }
        
//             console.log(`📢 Ride request sent to Driver ${nearestDriver.phone} for Passenger ${passengerId}`);
        
//             // Notify driver
//             const driverSocketId = connectedDrivers[nearestDriver.phone];
//             if (driverSocketId) {
//                 io.to(driverSocketId).emit("rideRequest", {
//                     passengerId,
//                     passengerSocketId: socket.id,
//                     pickupLocation: source, // Send full source object
//                     destinationLocation: destination, // Send full destination object
//                     message: "🚖 New Ride Request!"
//                 });
        
//                 // Store ride request
//                 activeRides[passengerId] = nearestDriver.phone;
//             } else {
//                 socket.emit("noDriversAvailable", { message: "❌ Driver found but not online." });
//             }
//         });
//         // Driver Accepts Ride
//         socket.on("acceptRide", async (data) => {
//             const { driverId, passengerId } = data;

//             if (activeRides[passengerId]) {
//                 return socket.emit("rideTaken", { message: "❌ Ride already accepted by another driver!" });
//             }

//             // Assign ride to the first driver who accepts
//             activeRides[passengerId] = driverId;
//             const passengerSocketId=connectedPassenger[passengerId];
//             const driverSocketId=connectedDrivers[driverId];
//             if(passengerSocketId){
//                 io.to(passengerSocketId).emit("rideAccepted",{
//                     driverId,
//                     driverSocketId,
//                     message:"Your Ride Has Been Accepted"
//                 })
//             }
//             if(driverSocketId){
//                 io.to(driverSocketId).emit("ride Assigned",{
//                     passengerId,
//                     passengerSocketId,
//                     message:"Passenger Connected To You"
//                 })
//             }

//             console.log(`✅ Driver ${driverId} accepted ride for Passenger ${passengerId}`);
//         });
//         socket.on("Send Message",(data)=>{
//             const {senderId,recieverId,message}=data
//             const recieverSocketId = connectedDrivers[recieverId] || connectedPassenger[recieverId];
//             if(recieverSocketId){
//                 io.to(recieverSocketId).emit("recieveMessage",{senderId,message})
//             }
//         })
//         // Handle Driver Disconnect
//         socket.on("disconnect", async () => {
//             const driverPhone = Object.keys(connectedDrivers).find(
//                 (phone) => connectedDrivers[phone] === socket.id
//             );

//             if (driverPhone) {
//                 await driverModel.findOneAndUpdate({ phone: driverPhone }, { isAvailable: false });
//                 delete connectedDrivers[driverPhone];
//                 console.log(`❌ Driver ${driverPhone} Disconnected`);
//             }
//         });
//     });
// };

// module.exports = { setupWebSocket };

const driverModel = require("../models/driverModel");
let activeRides = {}; // Stores active ride assignments
let connectedDrivers = {}; // Stores connected drivers & their locations
let connectedPassengers = {}; // Stores connected passengers
// Function to calculate distance between two coordinates using Haversine formula
function getDistance(coord1, coord2) {
    const R = 6371; // Radius of Earth in kilometers
    const lat1 = coord1.latitude;
    const lon1 = coord1.longitude;
    const lat2 = coord2.latitude;
    const lon2 = coord2.longitude;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

const setupWebSocket = (io) => {
    io.on("connection", (socket) => {
        console.log(`🚖 Connected: ${socket.id}`);

        // ✅ DRIVER REGISTRATION
        socket.on("register_driver", async (data) => {
            const { phone,latitude,longitude } = data;
            
            // Store the driver's socketId (without updating DB frequently)
            connectedDrivers[phone] = { socketId: socket.id, location: latitude && longitude ? { latitude, longitude } : null, };

            console.log(`✅ Driver ${phone} registered.`);

            // Update MongoDB **only once** when the driver registers
            await driverModel.findOneAndUpdate(
                { phone },
                { socketId: socket.id, isAvailable: true }
            );
        });

        // ✅ DRIVER LOCATION UPDATE (Only via Socket.IO, Not in DB)
        // socket.on("location_update", (data) => {
        //     const { phone, latitude, longitude } = data;

        //     // ✅ Update driver's location in memory (NOT in DB)
        //     if (connectedDrivers[phone]) {
        //         connectedDrivers[phone].location = { latitude, longitude };
        //     }

        //     console.log(`📍 Driver ${phone} location updated: ${latitude}, ${longitude}`);

        //     // 📢 Broadcast location **only to passengers**
        //     Object.values(connectedPassengers).forEach((passenger) => {
        //         io.to(passenger.socketId).emit("driver_location", { phone, latitude, longitude });
        //     });
        // });
        socket.on("location_update", (data) => {
            const { phone, latitude, longitude } = data;
            console.log(`location update event called`)
            // ✅ Ensure the driver exists in memory
            if (connectedDrivers[phone]) {
                connectedDrivers[phone].location = { latitude, longitude };
                console.log(`📍 Driver ${phone} location updated: ${latitude}, ${longitude}`);
            } else {
                console.log(`❌ Driver ${phone} is not found in connectedDrivers!`);
            }
        
            // 📢 Send location to all passengers
            Object.values(connectedPassengers).forEach((passenger) => {
                io.to(passenger.socketId).emit("driver_location", { phone, latitude, longitude });
            });
        });
        

        // ✅ PASSENGER REGISTRATION
        socket.on("register_passenger", (data) => {
            const { passengerId } = data;
            connectedPassengers[passengerId] = { socketId: socket.id };

            console.log(`👤 Passenger ${passengerId} registered.`);
        });

        // ✅ PASSENGER REQUESTS A RIDE
        socket.on("requestRide", async (data) => {
            const { passengerId, source, destination } = data;
        
            console.log(`🔍 Searching for drivers near: ${source.latitude}, ${source.longitude}`);
        
            // Find the nearest available driver **from memory** (not DB)
            let nearestDriver = null;
            let minDistance = Infinity;
        
            Object.keys(connectedDrivers).forEach((driverPhone) => {
                const driver = connectedDrivers[driverPhone];

                if (driver.location) {
                    const distance = getDistance(source, driver.location);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestDriver = driverPhone;
                    }
                }
            });
            console.log(`nearest drivers are ${nearestDriver}`)
            if (!nearestDriver) {
                return socket.emit("noDriversAvailable", { message: "❌ No drivers nearby." });
            }
        
            console.log(`📢 Ride request sent to Driver ${nearestDriver} for Passenger ${passengerId}`);
        
            // Notify only the nearest driver
            const driverSocketId = connectedDrivers[nearestDriver]?.socketId;
            if (driverSocketId) {
                io.to(driverSocketId).emit("rideRequest", {
                    passengerId,
                    pickupLocation: source,
                    destinationLocation: destination,
                    message: "New Ride Request!"
                });
        
                // Store ride request
                activeRides[passengerId] = nearestDriver;
            }
        });
        

        // ✅ DRIVER ACCEPTS RIDE (Now we update DB)
        socket.on("acceptRide", async (data) => {
            const { driverId, passengerId } = data;

            if (activeRides[passengerId]) {
                return socket.emit("rideTaken", { message: "❌ Ride already accepted!" });
            }

            // Assign ride to driver
            activeRides[passengerId] = driverId;
            const passengerSocketId = connectedPassengers[passengerId]?.socketId;
            const driverSocketId = connectedDrivers[driverId]?.socketId;

            if (passengerSocketId) {
                io.to(passengerSocketId).emit("rideAccepted", {
                    driverId,
                    message: "✅ Your Ride Has Been Accepted!"
                });
            }

            if (driverSocketId) {
                io.to(driverSocketId).emit("rideAssigned", {
                    passengerId,
                    message: "🚗 Passenger Connected!"
                });
            }

            // ✅ Now update the driver's location in DB (since ride is assigned)
            await driverModel.findOneAndUpdate(
                { phone: driverId },
                { isAvailable: false, location: connectedDrivers[driverId]?.location }
            );

            console.log(`✅ Driver ${driverId} accepted ride for Passenger ${passengerId}`);
        });

        // ✅ DRIVER DISCONNECTS
        socket.on("disconnect", async () => {
            const driverPhone = Object.keys(connectedDrivers).find(
                (phone) => connectedDrivers[phone].socketId === socket.id
            );

            if (driverPhone) {
                // Update DB **only when driver goes offline**
                await driverModel.findOneAndUpdate({ phone: driverPhone }, { isAvailable: false });
                delete connectedDrivers[driverPhone];
                console.log(`❌ Driver ${driverPhone} Disconnected`);
            }
        });
    });
};

module.exports = { setupWebSocket };
