let cache = {};

function getKey(req) {
  const url = req.originalUrl || req.url;
  return url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;
}

function cacheMiddleware(req, res, next) {
  if (req.method === 'GET') {
    const key = getKey(req);
    const cached = cache[key];
    const now = Date.now();

    if (cached) {
      if (now - cached.createdAt < 60000) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached.data);
      }
      delete cache[key];
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache[key] = {
          data: body,
          createdAt: Date.now()
        };
      }
      return originalJson(body);
    };

    return next();
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        clearCache();
      }
      return originalJson(body);
    };
    return next();
  }

  next();
}

function clearCache() {
  cache = {};
}

function getCache() {
  return cache;
}

module.exports = {
  cacheMiddleware,
  clearCache,
  invalidateCache: clearCache,
  getCache
};
