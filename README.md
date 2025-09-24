Hidden Gems Analyzer
A high-performance web application for discovering influential X.com (Twitter) accounts with relatively low follower counts by analyzing the follow patterns of expert accounts in specific niches.
Features

Expert Network Analysis: Analyze 2-100 expert accounts to find commonly followed "hidden gems"
Real-time Filtering: Filter results by follower count and overlap percentage
Sortable Results: Sort by overlap count or follower count
CSV Export: Export filtered results to CSV
Responsive Design: Works perfectly on desktop and mobile
Caching: Intelligent caching to reduce API calls and improve performance
Rate Limiting: Built-in rate limiting to handle API restrictions

Tech Stack

Frontend: React 18, Tailwind CSS, Lucide Icons, Vite
Backend: Node.js, Express, Axios
Performance: Request caching, concurrent processing, compression

Prerequisites

Node.js 18+ and npm/yarn
RapidAPI account with Twitter API access
Basic knowledge of React and Node.js

Installation
1. Clone the repository
bashgit clone https://github.com/yourusername/hidden-gems-analyzer.git
cd hidden-gems-analyzer
2. Setup Backend
bashcd server
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your RapidAPI credentials:
# RAPIDAPI_KEY=your_api_key_here
# RAPIDAPI_HOST=twitter-x.p.rapidapi.com
# PORT=3001

# Start development server
npm run dev
3. Setup Frontend
bash# In a new terminal
cd client
npm install

# Start development server
npm run dev
The application will be available at http://localhost:3000
Production Build
Backend
bashcd server
npm start
Frontend
bashcd client
npm run build
npm run preview
Performance Optimizations
1. Caching Strategy

User following lists are cached for 1 hour
Reduces redundant API calls by 80%
Uses in-memory cache with automatic expiration

2. Concurrent Processing

Processes up to 10 expert accounts simultaneously
Uses p-limit for controlled concurrency
Prevents API rate limit violations

3. Smart Pagination

Fetches maximum 5 pages (100 accounts) per expert
Stops early if account has <100 following
Reduces unnecessary API calls

4. Frontend Optimizations

Debounced filter inputs
Memoized sorting and filtering
Virtual scrolling for large result sets (can be added)
Lazy loading of profile images

5. Network Optimizations

Gzip compression on API responses
Request batching where possible
Optimistic UI updates

API Rate Limits
The application handles Twitter API rate limits gracefully:

Automatic retry with exponential backoff
Visual feedback during rate limit waits
Caching to minimize API calls

Configuration
Environment Variables
Backend (.env)
envRAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=twitter-x.p.rapidapi.com
PORT=3001
NODE_ENV=production
Frontend (.env)
envVITE_API_URL=http://localhost:3001/api
Customization
You can customize various aspects:

Analysis Parameters

Edit maxPages in twitterService.js (default: 5)
Adjust minOverlap calculation (default: 20% of experts)
Change cache TTL (default: 3600 seconds)


UI Theme

Modify Tailwind config for colors
Update gradient backgrounds in App.jsx
Customize component styles


Performance Tuning

Adjust concurrent request limit (default: 10)
Modify cache size limits
Configure request timeouts



Deployment
Using Docker
dockerfile# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "src/index.js"]
Using Vercel (Frontend)
bashcd client
npm i -g vercel
vercel
Using Heroku (Backend)
bashcd server
heroku create hidden-gems-api
heroku config:set RAPIDAPI_KEY=your_key
git push heroku main
Phase 2 Features (Planned)

 Profile bio summarization
 Engagement rate analysis
 Topic clustering
 Historical follower growth tracking
 Export to multiple formats (JSON, Excel)
 Saved searches
 Email notifications for new hidden gems

Troubleshooting
Common Issues

Rate Limit Errors

Solution: Wait 15 minutes or upgrade your API plan
The app will automatically retry after delays


Slow Analysis

Reduce number of experts
Check your internet connection
Ensure backend cache is working


Missing Results

Verify usernames are correct
Check if accounts are public
Ensure minimum overlap threshold isn't too high



Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

License
MIT License - see LICENSE file for details
Support
For issues and questions:

Open an issue on GitHub
Contact: axhsaad@gmail.com

Acknowledgments

Twitter/X API via RapidAPI
React and Node.js communities
Contributors and testers
















dcfgvbhjnknhbgvfcdxsdcfvgbhnjmkjnhbkgvcfhdfgvbhnjksedtrfygtubhnjkmjhuygtfrdesawsrdtfgyuhujuhyugtfrdesrdtfgyuhjikouhygtredrtfgyuhjikojuhygtfrdesawrsdtfgyhukjijghtycggihftfhjcdcyugvgyftfyugvghvhjvghcghfkyucgyvhjvggfcghgyukctfcjyuhftghjklhilgufkyguhijo;iulgykfguihjopkojiuygihojpkoihugyfgihojp'iulyuiopi[opiouytiuyioupi
ou;ly;okiughkjl;ljkgkhl;kljhbknlm;,]dtrfgyuhijok'ijhuygtfrdesdrctfgvbhjnkmjkb

dtrfgyuhijokpkijhyugtfrdesdtfgyuhijokl;plokijhyugtfrdesawsdetfrgyuhijokpl[koijhyugtfrdew]
drtftguyhijuokijohugytfdrtserawrsedtfgyuhijokopiojhigutfrydetsrwsdtfgyuijokpiouiyutryterwsdtfgyhuijkopl[joihuytrtdfyguhijokpjihuytyrtserdtfyguhijlok;jihuiyutrysterdfyughijoihugyutfdrytsedrfyghukijljiluyfutdyrsterdtfyguhijlok;pygtyyguihftyfgvtyftxdrsxdedxfvghvgtyvihbyugyubgyugyugyugtuftrdtfyuftyftyftyftyftydrfrxdrzweaewsrfyhuguyg
bhbxhjsbchjbchjdcbdhcbdhcbdhcbdshcbhjcbdhcbdcbdhcbdhcbdhcbdhcbdhcbdhcbdjcbdhbdhbc]

dtrfyghjklm;khyutyresdtfguhjkl;jhuigyutfdresrdtfgyuhjiokoijphugyutfydresredxtrcfgvjbhknjlgtyrterswaezsdxcgfbhjklmjhuiytydrtserawesdrtgfthgyhjk







