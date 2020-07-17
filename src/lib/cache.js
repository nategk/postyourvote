import nodeCache from 'node-cache'

class Cache {
  constructor(ttlSeconds) {
    this.cache = new nodeCache({stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2});
  }

  async get(key, getFromOriginFn) {
    var value = this.cache.get(key);
    if (value !== undefined) {
      console.log("Got", key, "from cache");
      return value;
    }

    value = await getFromOriginFn();
    console.log("Got", key, "from origin");
    this.cache.set(key, value);
    return value;
  }
}

export default Cache;
