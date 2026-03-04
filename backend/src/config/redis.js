const { createClient } = require("redis");
const { config } = require("./env");

let redisClient = null;

function getRedisClient() {
  return redisClient;
}

async function connectRedis() {
  if (!config.redisUrl) {
    console.warn("REDIS_URL missing. Running without Redis cache.");
    return null;
  }

  redisClient = createClient({ url: config.redisUrl });

  redisClient.on("error", (error) => {
    console.warn("Redis error:", error.message);
  });

  await redisClient.connect();
  console.log("Redis connected");
  return redisClient;
}

module.exports = { connectRedis, getRedisClient };