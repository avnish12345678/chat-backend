const express = require('express');
const { createServer } = require("http");
const cors = require('cors');
require('dotenv').config();
//const userRoutes = require('./routes/userResponseViaRedis');
const app = express();
app.use(cors());
app.use(express.json());
const httpServer = createServer(app);
require('./routes/userResponseViaRedis');
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Microservice running on port ${PORT}`));

