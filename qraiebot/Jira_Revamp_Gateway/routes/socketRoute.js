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

// console.log(redisOption);


const redisClient = redis.createClient(redisOption);
redisClient.on('error', (err) => console.error('Redis Client Error', err));



async function SentDataToMicroService(commandId, payload) {
    let result = '';
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const requestId = uuidv4(); // Generate a unique request ID
        const requestPayload = { id: requestId, message: payload };

        // Publish message to Redis
        await redisClient.publish(`microServiceUserSpace_${commandId}`, JSON.stringify(requestPayload));
        console.log('Message sent:', requestPayload);

        // Set up a Promise to wait for the response or timeout
        result = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('No response from MicroService'));
            }, 5000); // 5 seconds timeout

            // Subscribe to the response channel
            redisClient.subscribe(`microServiceUserSpace_${requestId}`, async (message) => {
                clearTimeout(timeout); // Clear the timeout on response
                try {
                    const responsePayload = JSON.parse(message);
                    console.log('Response received:', responsePayload);
                    resolve(responsePayload);
                } catch (parseError) {
                    reject(new Error('Failed to parse response'));
                } finally {
                    await redisClient.unsubscribe(`microServiceUserSpace_${requestId}`);
                }
            });

            redisClient.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error:', error.message);
        result = { error: error.message };
    }
    return result;
}


module.exports = SentDataToMicroService;