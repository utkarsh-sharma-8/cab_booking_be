const io = require("socket.io-client");
const socket = io("http://localhost:3000"); // Update with your actual server URL

socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO Server");

    // Register driver
    socket.emit("register_driver", {
        phone: "+1234567890"
    });

    socket.on("driver_location", (data) => {
        console.log("📍 Location Update:", data);
    });
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from server");
});
