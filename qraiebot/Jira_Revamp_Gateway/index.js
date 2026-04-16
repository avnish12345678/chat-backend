const express = require('express');
const { createServer } = require("http");
const cors = require('cors');
require('dotenv').config();
const userRoutes = require('./routes/userRouterRedis');
const app = express();
app.use(cors());
app.use(express.json());
const fs = require('fs');
const path = require('path');
const apiProtocol = process.env.apiProtocol || "development";

const PORT = process.env.PORT || 3000;
const serverIPA = process.env.serverIPA;
let io;
const apicert = {
    key: fs.readFileSync(path.join(__dirname, 'Certs', 'certkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'Certs', 'apicert.pem'))
};
const sentDataToMicroService = require('./routes/socketRoute');

app.use('/users', userRoutes);

if (apiProtocol == "development") {
    const httpServer = createServer(app);
    io = require('socket.io')(httpServer, {
        allowEIO3: true,
    });
    httpServer.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
} else {
    const https = require('https').Server(apicert, app);
    io = require('socket.io')(httpServer, {
        allowEIO3: true,
    });
    https.listen(PORT, serverIPA, function () {
        var msgInit = `Broker Node Server is listening at https://${serverIPA}:${PORT}`;
        console.log(msgInit);
    });
};

io.on("connection", async (socket) => {
    try {
        const connID = socket.id;
        const address = socket.handshake.address;

        console.log(`Client connected with ConnectionID: ${connID} from Remote IP: ${address}`);

        // Listener for 'message' event
        socket.on("message", async (cmdid, reqdata) => {
            try {
                console.log("Anish");
                console.log(`Received CommandId: ${cmdid}, Message: ${JSON.stringify(reqdata)}`);
                const result = await sentDataToMicroService(cmdid, reqdata);
                console.log(result);
                socket.emit("message", result);
            } catch (error) {
                console.error(`Error processing message from ConnectionID: ${connID}, CommandId: ${cmdid}, Data: ${JSON.stringify(reqdata)}`);
                console.error(`Error Details: ${error.message}`);
                socket.emit("error", { error: "An error occurred while processing your request." });
            }
        });

        // Listener for 'disconnect' event
        socket.on("disconnect", () => {
            console.log(`User ${connID} disconnected.`);
        });

       

    } catch (err) {
        console.error("Connection handling error:", err);
    }
});


