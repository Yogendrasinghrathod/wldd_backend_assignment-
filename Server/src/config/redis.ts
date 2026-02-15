import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL as string
});


client.on('error', err => console.log('Redis Client Error', err));

export async function connectRedis() {
    await client.connect();

}



export default client;