import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for large requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Cache implementation
class APICache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.loadFromLocalStorage();
  }

  set(key, data) {
    const entry = {
      data,
      timestamp: Date.now()
    };
    this.cache.set(key, entry);
    this.saveToLocalStorage();
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return null;
    }
    
    return cached.data;
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem('hiddenGemsCache');
  }

  saveToLocalStorage() {
    try {
      const cacheData = Array.from(this.cache.entries());
      localStorage.setItem('hiddenGemsCache', JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Could not save cache to localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('hiddenGemsCache');
      if (stored) {
        const cacheData = JSON.parse(stored);
        this.cache = new Map(cacheData);
      }
    } catch (e) {
      console.warn('Could not load cache from localStorage:', e);
    }
  }
}

const apiCache = new APICache();

let progressCallback = null;

export function setProgressCallback(callback) {
  progressCallback = callback;
}

export async function analyzeExperts(usernames, options = {}) {
  const {
    useCache = true,
    onProgress = null
  } = options;

  if (onProgress) progressCallback = onProgress;

  // Validate input
  if (!usernames || !Array.isArray(usernames)) {
    throw new Error('Invalid usernames provided - must be an array');
  }
  
  const cleanUsernames = usernames
    .filter(u => u && typeof u === 'string' && u.trim())
    .map(u => u.trim());
  
  if (cleanUsernames.length === 0) {
    throw new Error('No valid usernames provided');
  }

  try {
    const cacheKey = `analysis:${cleanUsernames.sort().join(',')}`; 
    
    // Check cache first
    if (useCache) {
      const cached = apiCache.get(cacheKey);
      if (cached) {
        console.log('Returning cached analysis results');
        progressCallback?.({ 
          phase: 'cached', 
          progress: 1,
          message: 'Loaded from cache!'
        });
        return cached;
      }
    }

    progressCallback?.({ 
      phase: 'starting', 
      progress: 0.1,
      message: `Preparing to analyze ${cleanUsernames.length} experts...`
    });

    progressCallback?.({ 
      phase: 'analyzing', 
      progress: 0.3,
      message: `Analyzing ${cleanUsernames.length} experts (fetching ~1000 accounts each)...`
    });

    const requestData = { usernames: cleanUsernames };
    console.log('Sending request to:', API_BASE_URL + '/analyze');
    console.log('Request data:', requestData);
    
    // Adjust timeout based on number of experts
    const timeoutMs = Math.max(60000, cleanUsernames.length * 20000); // 20s per expert, min 60s
    
    const response = await api.post('/analyze', requestData, {
      timeout: timeoutMs,
      onUploadProgress: (progressEvent) => {
        const progress = 0.3 + (progressEvent.loaded / progressEvent.total) * 0.2;
        progressCallback?.({ 
          phase: 'uploading', 
          progress,
          message: 'Sending request...'
        });
      },
      onDownloadProgress: (progressEvent) => {
        const progress = 0.5 + (progressEvent.loaded / progressEvent.total) * 0.5;
        progressCallback?.({ 
          phase: 'downloading', 
          progress,
          message: 'Receiving results...'
        });
      }
    });
    
    // Cache the results
    if (useCache && response.data) {
      apiCache.set(cacheKey, response.data);
    }

    progressCallback?.({ 
      phase: 'complete', 
      progress: 1,
      message: 'Analysis complete!'
    });

    return response.data;
  } catch (error) {
    progressCallback?.({ 
      phase: 'error', 
      progress: 0,
      message: 'Analysis failed'
    });

    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timeout - analyzing ${cleanUsernames.length} experts takes time. Try fewer experts or wait longer.`);
    }
    
    if (error.response) {
      throw new Error(error.response.data.error || `Server error: ${error.response.status}`);
    } else if (error.request) {
      throw new Error('Cannot connect to backend server. Please ensure the server is running.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export function clearCache() {
  apiCache.clear();
  console.log('Cache cleared');
}

export function getCacheStats() {
  return {
    size: apiCache.cache.size,
    entries: Array.from(apiCache.cache.keys()).map(key => ({
      key,
      age: Date.now() - apiCache.cache.get(key).timestamp
    }))
  };
}