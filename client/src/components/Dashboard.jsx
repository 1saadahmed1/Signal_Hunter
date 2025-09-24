import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Award,
  BarChart3,
  Activity,
  Calendar,
  ExternalLink,
  Search,
  Zap,
  Trash2,
  Download,
  RefreshCw,
  Globe,
  MapPin
} from 'lucide-react';

export function Dashboard({ analysisHistory, currentResults, onLoadAnalysis, onClearHistory }) {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalGemsFound: 0,
    averageOverlap: 0,
    topCategory: '',
    mostUsedExperts: [],
    bestGems: []
  });
  const [showMap, setShowMap] = useState(false);
  const [isDarkMode] = useState(() => !document.body.classList.contains('light-mode'));

  useEffect(() => {
    // Calculate statistics from analysis history
    if (analysisHistory && analysisHistory.length > 0) {
      const totalGems = analysisHistory.reduce((sum, a) => sum + a.totalResults, 0);
      const avgOverlap = analysisHistory.reduce((sum, a) => sum + (a.avgOverlap || 0), 0) / analysisHistory.length;
      
      // Find most used experts
      const expertCount = {};
      analysisHistory.forEach(analysis => {
        analysis.experts.forEach(expert => {
          expertCount[expert] = (expertCount[expert] || 0) + 1;
        });
      });
      
      const mostUsed = Object.entries(expertCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([expert, count]) => ({ expert, count }));
      
      // Collect all top gems
      const allGems = [];
      analysisHistory.forEach(analysis => {
        if (analysis.topGems) {
          allGems.push(...analysis.topGems);
        }
      });
      
      // Get unique ACTUAL hidden gems (low follower count + high overlap)
      const uniqueGems = allGems.reduce((acc, gem) => {
        // Only consider accounts with less than 50k followers as "hidden gems"
        if (gem.followers_count < 50000) {
          if (!acc[gem.username] || acc[gem.username].overlap_count < gem.overlap_count) {
            acc[gem.username] = gem;
          }
        }
        return acc;
      }, {});
      
      // Sort by a combination of low followers and high overlap
      const bestGems = Object.values(uniqueGems)
        .map(gem => ({
          ...gem,
          // Calculate a "hidden gem score" - high overlap with low followers
          hiddenScore: (gem.overlap_percentage || gem.overlap_count) / Math.log10(gem.followers_count + 100)
        }))
        .sort((a, b) => b.hiddenScore - a.hiddenScore)
        .slice(0, 5);
      
      setStats({
        totalAnalyses: analysisHistory.length,
        totalGemsFound: totalGems,
        averageOverlap: avgOverlap,
        topCategory: 'Tech Founders',
        mostUsedExperts: mostUsed,
        bestGems: bestGems
      });
    }
  }, [analysisHistory]);

  // Combine all results for map
  const allHistoricalResults = React.useMemo(() => {
    if (!analysisHistory || analysisHistory.length === 0) return [];
    
    const combinedResults = [];
    analysisHistory.forEach(analysis => {
      if (analysis.topGems && Array.isArray(analysis.topGems)) {
        combinedResults.push(...analysis.topGems);
      }
    });
    return combinedResults;
  }, [analysisHistory]);

  const mapData = currentResults || allHistoricalResults;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Total Analyses"
          value={stats.totalAnalyses}
          subtitle="All time"
          color="blue"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Gems Discovered"
          value={stats.totalGemsFound}
          subtitle="Total unique finds"
          color="purple"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg. Overlap"
          value={`${stats.averageOverlap.toFixed(1)}%`}
          subtitle="Across all analyses"
          color="green"
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          title="Top Category"
          value={stats.topCategory}
          subtitle="Most common type"
          color="yellow"
        />
      </div>

      {/* Map Toggle Button */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Geographic Distribution
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View where discovered accounts are located
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className={`px-4 py-2 ${showMap ? 'bg-blue-500 text-white' : `${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`} rounded-lg transition-colors flex items-center gap-2`}
        >
          <MapPin className="w-4 h-4" />
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Analyses - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Recent Analyses
            </h3>
            <div className="flex gap-2">
              {analysisHistory.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analysisHistory.length > 0 ? (
              analysisHistory.map((analysis) => (
                <div 
                  key={analysis.id}
                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all cursor-pointer group"
                  onClick={() => onLoadAnalysis(analysis.experts)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-white">
                          Analysis #{analysisHistory.indexOf(analysis) + 1}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(analysis.date).toLocaleDateString()} at {new Date(analysis.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {analysis.experts.slice(0, 5).map((expert, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
                          >
                            @{expert}
                          </span>
                        ))}
                        {analysis.experts.length > 5 && (
                          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs">
                            +{analysis.experts.length - 5} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{analysis.totalResults} gems found</span>
                        <span>{analysis.avgOverlap?.toFixed(1)}% avg overlap</span>
                      </div>
                    </div>
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all">
                      <RefreshCw className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No analyses yet</p>
                <p className="text-gray-500 text-xs mt-1">Start analyzing to see history</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats and Quick Actions */}
        <div className="space-y-6">
          {/* Most Used Experts */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              Most Used Experts
            </h3>
            <div className="space-y-2">
              {stats.mostUsedExperts.length > 0 ? (
                stats.mostUsedExperts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-white">@{item.expert}</span>
                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded">
                      {item.count} times
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* Best Hidden Gems Found */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              Best Hidden Gems
              <span className="text-xs text-gray-400">(&lt;50k followers)</span>
            </h3>
            <div className="space-y-2">
              {stats.bestGems.length > 0 ? (
                stats.bestGems.map((gem, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-yellow-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm text-white">@{gem.username}</p>
                        <p className="text-xs text-gray-400">
                          {gem.followers_count?.toLocaleString()} followers • {gem.overlap_count} experts
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://x.com/${gem.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No hidden gems discovered yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Tech Leaders"
          description="Analyze top tech founders"
          experts={['elonmusk', 'sama', 'paulg', 'naval', 'patrickc']}
          onLoad={onLoadAnalysis}
          color="blue"
          icon={<Search className="w-5 h-5" />}
        />
        <QuickActionCard
          title="AI Researchers"
          description="Discover AI/ML experts"
          experts={['karpathy', 'ylecun', 'geoffreyhinton', 'demishassabis']}
          onLoad={onLoadAnalysis}
          color="purple"
          icon={<Activity className="w-5 h-5" />}
        />
        <QuickActionCard
          title="Crypto Builders"
          description="Find Web3 innovators"
          experts={['vitalikbuterin', 'cz_binance', 'balajis', 'cdixon']}
          onLoad={onLoadAnalysis}
          color="green"
          icon={<Zap className="w-5 h-5" />}
        />
      </div>

      {/* Export Section */}
      {analysisHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Export Analysis History</h3>
              <p className="text-sm text-gray-400">Download all your analysis data as JSON</p>
            </div>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(analysisHistory, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `analysis-history-${Date.now()}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md rounded-xl p-6 border`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`${colorClasses[color].split(' ')[3]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ title, description, experts, onLoad, color, icon }) {
  const colorClasses = {
    blue: 'hover:border-blue-400 hover:bg-blue-500/10',
    purple: 'hover:border-purple-400 hover:bg-purple-500/10',
    green: 'hover:border-green-400 hover:bg-green-500/10'
  };

  const iconColors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400'
  };

  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 cursor-pointer transition-all ${colorClasses[color]}`}
      onClick={() => onLoad(experts)}
    >
      <div className={`flex items-center gap-2 mb-3 ${iconColors[color]}`}>
        {icon}
        <h4 className="text-lg font-semibold text-white">{title}</h4>
      </div>
      <p className="text-sm text-gray-400 mb-3">{description}</p>
      <div className="flex flex-wrap gap-1">
        {experts.slice(0, 3).map((expert, idx) => (
          <span key={idx} className="text-xs bg-white/10 text-blue-300 px-2 py-1 rounded">
            @{expert}
          </span>
        ))}
        {experts.length > 3 && (
          <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded">
            +{experts.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}