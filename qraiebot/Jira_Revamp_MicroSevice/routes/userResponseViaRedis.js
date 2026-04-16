const redis = require("redis");
const retryStrategy = require("node-redis-retry-strategy");
const { v4: uuidv4 } = require('uuid');
const axios = require("axios");
const JQL = require('../utils/API_JQL');

const redisOption = {
    port: process.env.REDIS_PORT ,
    host: process.env.REDIS_IP ,
    password: process.env.REDIS_PASSWORD ,
    retry_strategy: retryStrategy({ delay_of_retry_attempts: 1 })
};

const CommandIds = require('../utils/Commands');

function jiraBasicAuthHeader() {
    const botEmail = process.env.BOT_EMAIL;
    const botToken = process.env.BOT_TOKEN;
    if (!botEmail || !botToken) {
        throw new Error('BOT_EMAIL and BOT_TOKEN environment variables are required');
    }
    return `Basic ${Buffer.from(`${botEmail}:${botToken}`).toString('base64')}`;
}

console.log(redisOption);
const subscriberClient = redis.createClient(redisOption);
const publisherClient = redis.createClient(redisOption);




subscriberClient.on('error', (err) => console.error('Redis Subscriber Error', err));
publisherClient.on('error', (err) => console.error('Redis Publisher Error', err));

const runResponse = async () => {
    try {

        if (!subscriberClient.isOpen) {
            await subscriberClient.connect();
        }
        if (!publisherClient.isOpen) {
            await publisherClient.connect();
        }
        

        // Subscribe to the request channel
        
        subscriberClient.subscribe(CommandIds.openTickets, async (message) => {
            try {
                const requestPayload = JSON.parse(message);
                console.log('Message received:', requestPayload);
                const result = await GetUserOpenTicketsDetails(requestPayload);
                const responsePayload = { id: requestPayload.id, message: result };

                // Publish response to the specific response channel
                await publisherClient.publish(`microServiceUserSpace_${requestPayload.id}`, JSON.stringify(responsePayload));

                console.log('Response sent:', responsePayload);
            } catch (err) {
                console.error('Error processing request:', err);
            }
        });

        subscriberClient.subscribe(CommandIds.dueTickets, async (message) => {
            try {
                const requestPayload = JSON.parse(message);
                console.log('Message received:', requestPayload);
                const result = await GetUserDueTicketDetails(requestPayload);
                const responsePayload = { id: requestPayload.id, message: result };

                // Publish response to the specific response channel
                await publisherClient.publish(`microServiceUserSpace_${requestPayload.id}`, JSON.stringify(responsePayload));

                console.log('Response sent:', responsePayload);
            } catch (err) {
                console.error('Error processing request:', err);
            }
        });

        subscriberClient.subscribe(CommandIds.completedTickets, async (message) => {
            try {
                const requestPayload = JSON.parse(message);
                console.log('Message received:', requestPayload);
                const result = await GetUserDetail(requestPayload);
                const responsePayload = { id: requestPayload.id, message: result };

                // Publish response to the specific response channel
                await publisherClient.publish(`microServiceUserSpace_${requestPayload.id}`, JSON.stringify(responsePayload));

                console.log('Response sent:', responsePayload);
            } catch (err) {
                console.error('Error processing request:', err);
            }
        });

        subscriberClient.subscribe(CommandIds.allUsersId, async (message) => {
            try {
                const requestPayload = JSON.parse(message);
                console.log('Message received:', requestPayload);
                const result = await GetAllUserId();
                const responsePayload = { id: requestPayload.id, message: result };

                // Publish response to the specific response channel
                await publisherClient.publish(`microServiceUserSpace_${requestPayload.id}`, JSON.stringify(responsePayload));

                console.log('Response sent:', responsePayload);
            } catch (err) {
                console.error('Error processing request:', err);
            }
        });
        


    } catch (error) {
        console.log(error);
    }
}


async function GetUserDetail(payload) {
    try {
        const { id } = payload.message;
        const apiUrl = JQL.JQL_API; // Replace with your actual API URL

        const authToken = jiraBasicAuthHeader();
        const postData = {
            jql: `Assignee = '${id}`,
            fieldsByKeys: true,
            maxResults: 100,
            expand: 'names,schema',
        };

        console.log('Sending API request with data:', postData);

        // Make the API request
        const response = await axios.post(apiUrl, postData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken,
                'Accept': 'application/json'
            },
        });
        console.log(response.headers);
        console.log('API Response:', response.data.issues);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        throw error; // Propagate error to caller
    }
}

async function GetUserOpenTicketsDetails(payload) {
    try {
        const { id } = payload.message;
        const apiUrl = JQL.JQL_API; // Replace with your actual API URL

        const authToken = jiraBasicAuthHeader();
        const postData = {
            jql: `Assignee = '${id}' AND statusCategory != Done`,
            fieldsByKeys: true,
            maxResults: 100,
            expand: 'names,schema',
        };

        console.log('Sending API request with data:', postData);

        // Make the API request
        const response = await axios.post(apiUrl, postData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken,
                'Accept': 'application/json'
            },
        });
        console.log(response.headers);
        console.log('API Response:', response.data.issues);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        throw error; // Propagate error to caller
    }
}

async function GetUserDueTicketDetails(payload) {
    try {
        const { id } = payload.message;
        const apiUrl = JQL.JQL_API; // Replace with your actual API URL

        const authToken = jiraBasicAuthHeader();
        const postData = {
            jql: `Assignee = '${id}' AND  due is not EMPTY`,
            fieldsByKeys: true,
            maxResults: 100,
            expand: 'names,schema',
        };

        console.log('Sending API request with data:', postData);

        // Make the API request
        const response = await axios.post(apiUrl, postData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken,
                'Accept': 'application/json'
            },
        });
        console.log(response.headers);
        console.log('API Response:', response.data.issues);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        throw error; // Propagate error to caller
    }
}


async function GetAllUserId() {
    try {
        const apiUrl = JQL.AllUsersId; // Replace with your actual API URL

        const authToken = jiraBasicAuthHeader();
        // Make the API request
        const response = await axios.get(apiUrl,  {
            headers: {
                'Content-Type': 'application/json',
                Authorization: authToken,
                'Accept': 'application/json'
            },
        });
        console.log(response.headers);
        console.log('API Response:', response.data.issues);
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        throw error; // Propagate error to caller
    }
}
//runResponse();

setTimeout(() => {
    console.log("Delayed for 10 second.");
    runResponse();
  }, "10000");


