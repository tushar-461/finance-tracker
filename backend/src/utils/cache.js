const { getRedisClient } = require("../config/redis");

async function cacheGet(key) {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
}

async function cacheSet(key, data, ttlSeconds) {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  await client.set(key, JSON.stringify(data), {
    EX: ttlSeconds,
  });
}

async function cacheDelPattern(pattern) {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  const keys = await client.keys(pattern);
  if (keys.length) {
    await client.del(keys);
  }
}

module.exports = {
  cacheGet,
  cacheSet,
  cacheDelPattern,
};