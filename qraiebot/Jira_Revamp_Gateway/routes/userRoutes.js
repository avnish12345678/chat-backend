const express = require('express');
const router = express.Router();
const redis = require("redis");
const retryStrategy = require("node-redis-retry-strategy");
const SendRequestGatewayToMicroservice = require('../redis/redis');
const { Kafka } = require('kafkajs');

// Kafka configuration
const kafka = new Kafka({
    clientId: 'JIRA_GateWay',
    brokers: ['localhost:9092'], // Kafka broker address
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'response-group' });

// Initialize Kafka connections
const initializeKafka = async () => {
    try {
        await producer.connect();
        await consumer.connect();
        console.log('Kafka producer and consumer connected.');

        // Subscribe to the response topic
        await consumer.subscribe({ topic: 'response-topic', fromBeginning: false });

        // Run the consumer continuously
        consumer.run({
            eachMessage: async ({ message }) => {
                const response = JSON.parse(message.value.toString());
                // Handle the response (match correlationId later in requests)
                if (responseMap.has(response.correlationId)) {
                    responseMap.get(response.correlationId)(response); // Resolve the promise
                    responseMap.delete(response.correlationId);
                }
            },
        });
    } catch (error) {
        console.error('Error initializing Kafka:', error);
    }
};

// Call the initialization function
initializeKafka();

// Map to store pending responses
const responseMap = new Map();

// POST route to handle requests
router.post('/', async (req, res) => {
    try {
        const correlationId = `${Date.now()}`; // Unique ID for matching the response

        // Send the request to Kafka
        await producer.send({
            topic: 'JIRA_MicroService',
            messages: [
                {
                    key: correlationId,
                    value: JSON.stringify({ message: req.body, timestamp: Date.now() }),
                },
            ],
        });

        console.log(`Message sent to Kafka with correlationId: ${correlationId}`);

        // Wait for the response with a timeout
        const response = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                responseMap.delete(correlationId);
                reject(new Error('Response timeout'));
            }, 10000); // 10-second timeout

            responseMap.set(correlationId, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });
        });

        // Send the response back to the client
        res.status(200).send(response);
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

module.exports = router;
