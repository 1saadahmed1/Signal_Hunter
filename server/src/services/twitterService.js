import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import pLimit from 'p-limit';
import NodeCache from 'node-cache';

export class TwitterService {
  constructor() {
    console.log('=== TwitterService Constructor START ===');
    this.apiKey = process.env.RAPIDAPI_KEY;
    this.apiHost = process.env.RAPIDAPI_HOST || 'twitter283.p.rapidapi.com';
    
    console.log('TwitterService initialized with:');
    console.log('API Host:', this.apiHost);
    console.log('API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NO KEY LOADED');
    
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
    this.limit = pLimit(5); // Increased concurrency to 5
    
    this.headers = {
      'x-rapidapi-key': this.apiKey,
      'x-rapidapi-host': this.apiHost
    };
    
    console.log('Headers configured');
    console.log('=== TwitterService Constructor END ===');
  }

  async analyzeExperts(usernames) {
    console.log('\n=== TwitterService.analyzeExperts START ===');
    console.log('Processing', usernames.length, 'experts');
    
    // Validate input
    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      throw new Error('Invalid usernames provided');
    }
    
    const followsMap = new Map();
    const accountDetails = new Map();
    const totalExperts = usernames.length;
    
    // Fetch following for each expert in parallel with concurrency limit
    console.log('Fetching following lists...');
    const startTime = Date.now();
    
    const followingPromises = usernames.map(username => 
      this.limit(() => this.getExpertFollowing(username))
    );
    
    const results = await Promise.allSettled(followingPromises);
    
    console.log(`Fetched all following lists in ${(Date.now() - startTime) / 1000}s`);
    
    // Process results
    results.forEach((result, index) => {
      const expertUsername = usernames[index];
      
      if (result.status === 'fulfilled') {
        const following = result.value;
        console.log(`@${expertUsername}: ${following.length} accounts`);
        
        following.forEach(account => {
          const username = account.screen_name;
          if (!username) return;
          
          // Update follows map
          if (!followsMap.has(username)) {
            followsMap.set(username, new Set());
          }
          followsMap.get(username).add(expertUsername);
          
          // Store account details
          if (!accountDetails.has(username)) {
            accountDetails.set(username, account);
          }
        });
      } else {
        console.error(`Failed to get following for ${usernames[index]}:`, result.reason?.message);
      }
    });
    
    // Convert to results format
    const analysisResults = [];
    const minOverlap = Math.max(2, Math.floor(totalExperts * 0.2));
    
    followsMap.forEach((expertsFollowing, username) => {
      const overlapCount = expertsFollowing.size;
      
      if (overlapCount >= minOverlap) {
        const account = accountDetails.get(username) || {};
        
        analysisResults.push({
          username,
          overlap_count: overlapCount,
          overlap_percentage: (overlapCount / totalExperts) * 100,
          overlap_fraction: `${overlapCount}/${totalExperts}`,
          followers_count: account.followers_count || 0,
          following_count: account.friends_count || 0,
          description: account.description || '',
          verified: account.verified || false,
          experts_following: Array.from(expertsFollowing),
          profile_url: `https://x.com/${username}`
        });
      }
    });
    
    // Sort by overlap count
    analysisResults.sort((a, b) => b.overlap_count - a.overlap_count);
    
    console.log(`Analysis complete in ${(Date.now() - startTime) / 1000}s`);
    console.log(`Found ${analysisResults.length} accounts with sufficient overlap`);
    
    return analysisResults;
  }

  async getExpertFollowing(username) {
    const cacheKey = `following_${username}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      console.log(`Cache HIT for @${username}`);
      return cached;
    }
    
    console.log(`Fetching @${username}...`);
    const startTime = Date.now();
    
    const allFollowing = [];
    let cursor = null;
    const maxPages = 5;  // 5 pages × 200 = 1000 accounts
    const maxFollowing = 1000;
    const perPage = 200; // Maximum allowed by API
    
    for (let page = 0; page < maxPages; page++) {
      try {
        const { accounts, nextCursor } = await this.fetchFollowingPage(username, cursor, perPage);
        
        if (!accounts || accounts.length === 0) {
          break;
        }
        
        allFollowing.push(...accounts);
        
        if (!nextCursor || nextCursor === '-1' || allFollowing.length >= maxFollowing) {
          break;
        }
        
        cursor = nextCursor;
        
        // Minimal delay between requests
        if (page < maxPages - 1) {
          await this.delay(50);
        }
      } catch (error) {
        console.error(`Error on page ${page} for @${username}:`, error.message);
        if (error.response?.status === 429) {
          console.log('Rate limited, waiting 5s...');
          await this.delay(5000);
          page--; // Retry this page
        } else {
          break;
        }
      }
    }
    
    const trimmedFollowing = allFollowing.slice(0, maxFollowing);
    console.log(`Fetched ${trimmedFollowing.length} for @${username} in ${(Date.now() - startTime) / 1000}s`);
    
    // Cache the results
    this.cache.set(cacheKey, trimmedFollowing);
    
    return trimmedFollowing;
  }

  async fetchFollowingPage(username, cursor = null, count = 200) {
    // Build URL with larger page size
    let url = `https://${this.apiHost}/FollowingLight?username=${username}&count=${count}`;
    if (cursor) {
      url += `&cursor=${cursor}`;
    }
    
    try {
      const response = await axios.get(url, { 
        headers: this.headers,
        timeout: 10000 // 10 second timeout
      });
      
      const data = response.data;
      const accounts = data.users || [];
      const nextCursor = data.next_cursor_str;
      
      // Transform to consistent format
      const transformedAccounts = accounts.map(user => ({
        screen_name: user.screen_name,
        name: user.name || '',
        followers_count: user.followers_count || 0,
        friends_count: user.friends_count || 0,
        description: user.description || '',
        verified: user.verified || false,
        statuses_count: user.statuses_count || 0
      }));
      
      return { 
        accounts: transformedAccounts, 
        nextCursor 
      };
    } catch (error) {
      console.error(`API Error for @${username}:`, error.response?.status || error.message);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Pre-cache popular accounts on startup
  async precacheExperts() {
    const popularExperts = ['naval', 'paulg', 'elonmusk', 'sama', 'balajis'];
    console.log('Pre-caching popular experts...');
    
    const promises = popularExperts.map(username => 
      this.getExpertFollowing(username).catch(err => 
        console.error(`Failed to cache ${username}:`, err.message)
      )
    );
    
    await Promise.all(promises);
    console.log('Pre-caching complete');
  }
}