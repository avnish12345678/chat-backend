const express = require('express');
const router = express.Router();
const redis = require("redis");
const retryStrategy = require("node-redis-retry-strategy");
const { v4: uuidv4 } = require('uuid');
const commandIds = require('../utils/Commands'); 

const redisOption = {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_IP || "127.0.0.1",
    password: process.env.REDIS_PASSWORD || "Hbss@2025",
    retry_strategy: retryStrategy({ delay_of_retry_attempts: 1 })
};

const redisClient = redis.createClient(redisOption);
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis connected to', redisOption.host + ':' + redisOption.port));


router.post('/openTickets', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
        await redisClient.connect();
        }
        const requestId = uuidv4(); // Generate a unique request ID
        const requestPayload = { id: requestId, message: req.body };

        // Publish message to Redis
        await redisClient.publish(commandIds.openTickets, JSON.stringify(requestPayload));

        console.log('Message sent:', requestPayload);

        // Set up a timeout for response
        const timeout = setTimeout(() => {
            res.status(500).json({ error: 'No response from MicroService' });
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        }, 5000); // 5 seconds timeout

        // Listen for the response
        redisClient.subscribe(`microServiceUserSpace_${requestId}`, (message) => {
            clearTimeout(timeout); // Clear the timeout when response is received
            const responsePayload = JSON.parse(message);
            console.log('Response received:', responsePayload);
            res.json(responsePayload);
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        });
    } catch (error) {
        console.log(error);
    }
});


router.post('/dueTickets', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
        await redisClient.connect();
        }
        const requestId = uuidv4(); // Generate a unique request ID
        const requestPayload = { id: requestId, message: req.body };

        // Publish message to Redis
        await redisClient.publish(commandIds.dueTickets, JSON.stringify(requestPayload));

        console.log('Message sent:', requestPayload);

        // Set up a timeout for response
        const timeout = setTimeout(() => {
            res.status(500).json({ error: 'No response from MicroService' });
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        }, 5000); // 5 seconds timeout

        // Listen for the response
        redisClient.subscribe(`microServiceUserSpace_${requestId}`, (message) => {
            clearTimeout(timeout); // Clear the timeout when response is received
            const responsePayload = JSON.parse(message);
            console.log('Response received:', responsePayload);
            res.json(responsePayload);
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/completedTickets', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
        await redisClient.connect();
        }
        const requestId = uuidv4(); // Generate a unique request ID
        const requestPayload = { id: requestId, message: req.body };

        // Publish message to Redis
        await redisClient.publish(commandIds.completedTickets, JSON.stringify(requestPayload));

        console.log('Message sent:', requestPayload);

        // Set up a timeout for response
        const timeout = setTimeout(() => {
            res.status(500).json({ error: 'No response from MicroService' });
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        }, 5000); // 5 seconds timeout

        // Listen for the response
        redisClient.subscribe(`microServiceUserSpace_${requestId}`, (message) => {
            clearTimeout(timeout); // Clear the timeout when response is received
            const responsePayload = JSON.parse(message);
            console.log('Response received:', responsePayload);
            res.json(responsePayload);
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        });
    } catch (error) {
        console.log(error);
    }
});

router.post('/totalTickets', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
        await redisClient.connect();
        }
        const requestId = uuidv4(); // Generate a unique request ID
        const requestPayload = { id: requestId, message: req.body };

        // Publish message to Redis
        await redisClient.publish(commandIds.totalTickets, JSON.stringify(requestPayload));

        console.log('Message sent:', requestPayload);

        // Set up a timeout for response
        const timeout = setTimeout(() => {
            res.status(500).json({ error: 'No response from MicroService' });
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        }, 5000); // 5 seconds timeout

        // Listen for the response
        redisClient.subscribe(`microServiceUserSpace_${requestId}`, (message) => {
            clearTimeout(timeout); // Clear the timeout when response is received
            const responsePayload = JSON.parse(message);
            console.log('Response received:', responsePayload);
            res.json(responsePayload);
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/allUsersId', async (req, res) => {
    try {
        if (!redisClient.isOpen) {
        await redisClient.connect();
        }
        const requestId = uuidv4(); // Generate a unique request ID
        const requestPayload = { id: requestId, message: "" };

        // Publish message to Redis
        await redisClient.publish(commandIds.allUsersId, JSON.stringify(requestPayload));

        console.log('Message sent:', requestPayload);

        // Set up a timeout for response
        const timeout = setTimeout(() => {
            res.status(500).json({ error: 'No response from MicroService' });
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        }, 5000); // 5 seconds timeout

        // Listen for the response
        redisClient.subscribe(`microServiceUserSpace_${requestId}`, (message) => {
            clearTimeout(timeout); // Clear the timeout when response is received
            const responsePayload = JSON.parse(message);
            console.log('Response received:', responsePayload);
            res.json(responsePayload);
            redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
        });
    } catch (error) {
        console.log(error);
    }
});
module.exports = router;
