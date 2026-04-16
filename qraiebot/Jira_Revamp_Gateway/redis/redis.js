const redis = require("redis");
const retryStrategy = require("node-redis-retry-strategy");

const redisPub = redis.createClient(redisOption); 

async function SendRequestGatewayToMicroservice(theRequestBody,theChannelName){
    try {
        const payload={
            "CorreationId":`${`${Date.now()}`}`,
            "Message":theRequestBody
        }
        console.log(`Request to MicroService`);
        redisPub.publish("MicroServiceUserSpace", JSON.stringify(aPayload));
        
    } catch (error) {
        console.log(error);
    }
}


module.exports = SendRequestGatewayToMicroservice;
