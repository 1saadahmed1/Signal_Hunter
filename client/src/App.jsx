import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  BarChart3, 
  Search,
  Download,
  RefreshCw,
  Users,
  ArrowUp,
  Sun,
  Moon,
  Info,
  X,
  Activity,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { InputSection } from './components/InputSection';
import { FilterControls } from './components/FilterControls';
import { LoadingState } from './components/LoadingState';
import { analyzeExperts, clearCache, getCacheStats } from './services/api';
import { parseUsernames } from './utils/helpers';
import { EnhancedResultsTable } from './components/EnhancedResultsTable';
import { QuickGroups } from './components/QuickGroups';
import { Dashboard } from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('analyzer');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true;
  });
  const [showAbout, setShowAbout] = useState(false);
  const [userInput, setUserInput] = useState(
    'naval\npatrickc\npaulg\nbalajis\nsama'
  );
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    phase: '',
    progress: 0,
    message: ''
  });
  const [useCache, setUseCache] = useState(true);
  const [filters, setFilters] = useState({
    minFollowers: 0,
    maxFollowers: 10000000,
    minOverlap: 2,
    searchQuery: '',
    verifiedOnly: false,
    hasBio: false,
    activeRecently: false,
    englishOnly: false
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'overlap_count',
    direction: 'desc'
  });
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [quickGroupsExpanded, setQuickGroupsExpanded] = useState(true);
  const resultsRef = useRef(null);

  // Apply theme to body on mount and when it changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Load analysis history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('analysisHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        const validHistory = parsed.filter(item => 
          item && item.experts && Array.isArray(item.experts)
        );
        setAnalysisHistory(validHistory);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      localStorage.removeItem('analysisHistory');
    }
  }, []);

  // Save analysis history to localStorage
  useEffect(() => {
    if (analysisHistory.length > 0) {
      localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    }
  }, [analysisHistory]);

  // Handle scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAnalyze = useCallback(async () => {
    const usernames = parseUsernames(userInput);
    
    if (!Array.isArray(usernames)) {
      setError('Error parsing usernames');
      return;
    }
    
    if (usernames.length < 2) {
      setError('Please enter at least 2 usernames');
      return;
    }
    
    if (usernames.length > 100) {
      setError('Please enter no more than 100 usernames');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ phase: 'starting', progress: 0, message: 'Initializing signal detection...' });
    
    try {
      const data = await analyzeExperts(usernames, {
        useCache,
        batchSize: 5,
        maxFollowsPerExpert: 2000,
        onProgress: (progressData) => {
          setProgress(progressData);
        }
      });
      
      setResults(data);
      
      // Save to analysis history
      const newAnalysis = {
        id: Date.now(),
        date: new Date().toISOString(),
        experts: usernames,
        totalResults: data.length,
        topGems: data.slice(0, 5),
        avgOverlap: data.length > 0 
          ? data.reduce((sum, r) => sum + r.overlap_percentage, 0) / data.length 
          : 0
      };
      
      setAnalysisHistory(prev => [newAnalysis, ...prev].slice(0, 20));
      
      // Auto-adjust filters
      if (data && data.length > 0) {
        const maxFollowersInResults = Math.max(...data.map(r => r.followers_count));
        setFilters(prev => ({
          ...prev,
          minFollowers: 0,
          maxFollowers: maxFollowersInResults + 1000000
        }));
      }
      
      // Show success notification
      showNotification('Analysis complete!', 'success');
      
      // Auto-scroll to results after a short delay
      setTimeout(() => {
        scrollToResults();
      }, 500);
      
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
      setProgress({ phase: '', progress: 0, message: '' });
    }
  }, [userInput, useCache]);

  const filteredAndSortedResults = useMemo(() => {
    if (!results) return [];

    let filtered = results.filter(account => {
      // Basic filters
      if (account.followers_count < filters.minFollowers) return false;
      if (account.followers_count > filters.maxFollowers) return false;
      if (account.overlap_count < filters.minOverlap) return false;
      
      // Search filter
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesUsername = account.username?.toLowerCase().includes(query);
        const matchesBio = account.description?.toLowerCase().includes(query);
        const matchesName = account.name?.toLowerCase().includes(query);
        if (!matchesUsername && !matchesBio && !matchesName) return false;
      }
      
      // Advanced filters
      if (filters.verifiedOnly && !account.verified) return false;
      
      if (filters.hasBio && (!account.description || account.description.trim() === '')) return false;
      
      if (filters.activeRecently) {
        if (account.last_tweet_date) {
          const lastTweetDate = new Date(account.last_tweet_date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (lastTweetDate < thirtyDaysAgo) return false;
        }
      }
      
      if (filters.englishOnly && account.description) {
        const nonEnglishPattern = /[\u0600-\u06FF\u0750-\u077F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0400-\u04FF]/;
        if (nonEnglishPattern.test(account.description)) {
          return false;
        }
      }
      
      return true;
    });

    // Sort results
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [results, filters, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  }, []);

  const exportToCsv = useCallback(() => {
    if (!filteredAndSortedResults.length) return;

    const headers = ['Rank', 'Username', 'Name', 'Overlap Count', 'Overlap %', 'Followers', 'Following', 'Verified', 'Bio', 'Experts Following'];
    const rows = filteredAndSortedResults.map((account, index) => [
      index + 1,
      account.username,
      account.name || '',
      account.overlap_count,
      account.overlap_percentage.toFixed(1),
      account.followers_count,
      account.following_count,
      account.verified ? 'Yes' : 'No',
      `"${(account.description || '').replace(/"/g, '""')}"`,
      `"${(account.experts_following || []).join(', ')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signal_hunter_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('CSV exported successfully!', 'success');
  }, [filteredAndSortedResults]);

  const resetFilters = useCallback(() => {
    if (!results || results.length === 0) return;
    
    const maxFollowersInResults = Math.max(...results.map(r => r.followers_count));
    setFilters({
      minFollowers: 0,
      maxFollowers: maxFollowersInResults + 1000000,
      minOverlap: 2,
      searchQuery: '',
      verifiedOnly: false,
      hasBio: false,
      activeRecently: false,
      englishOnly: false
    });
  }, [results]);

  const handleClearCache = useCallback(() => {
    clearCache();
    showNotification('Cache cleared successfully!', 'info');
  }, []);

  const handleLoadAnalysis = useCallback((experts) => {
    if (!experts || !Array.isArray(experts)) {
      setError('Invalid analysis data');
      return;
    }
    
    setUserInput(experts.join('\n'));
    setCurrentView('analyzer');
    
    setTimeout(() => {
      handleAnalyze();
    }, 100);
  }, [handleAnalyze]);

  const showNotification = (message, type = 'info') => {
    console.log(`[${type}] ${message}`);
  };

  const stats = useMemo(() => ({
    totalGems: results?.length || 0,
    filteredGems: filteredAndSortedResults.length,
    avgOverlap: results?.length 
      ? (results.reduce((sum, r) => sum + r.overlap_percentage, 0) / results.length).toFixed(1)
      : 0,
    topExpert: results?.length && results[0]?.experts_following?.length
      ? results[0].experts_following[0]
      : null,
    verifiedCount: filteredAndSortedResults.filter(r => r.verified).length,
    withBioCount: filteredAndSortedResults.filter(r => r.description && r.description.trim()).length
  }), [results, filteredAndSortedResults]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setShowAbout(true)}
            className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} rounded-lg transition-colors flex items-center gap-2 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <Info className="w-4 h-4" />
            About
          </button>
          
          <button
            onClick={toggleTheme}
            className={`p-2.5 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} rounded-lg transition-colors border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className={`w-5 h-5 ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
            ) : (
              <Moon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Activity className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className={`text-5xl md:text-6xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Signal Hunter
            </h1>
            <Target className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Discover hidden signals by analyzing what expert networks are following
          </p>
          
          {/* Navigation Pills */}
          <div className={`inline-flex ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-1 mt-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setCurrentView('analyzer')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentView === 'analyzer' 
                  ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              Analyzer
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentView === 'dashboard' 
                  ? `${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}` 
                  : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              Dashboard
            </button>
          </div>

          {/* Live Stats Bar */}
          {results && currentView === 'analyzer' && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className="text-blue-500 font-bold">{stats.totalGems}</span>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>Total</span>
              </div>
              <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className="text-green-500 font-bold">{stats.filteredGems}</span>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>Filtered</span>
              </div>
              <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className="text-purple-500 font-bold">{stats.avgOverlap}%</span>
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ml-2`}>Avg Overlap</span>
              </div>
            </div>
          )}
        </header>

        {/* View Content */}
        {currentView === 'analyzer' ? (
          <div>
            {/* Input Section - First */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 mb-8 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <InputSection
                userInput={userInput}
                setUserInput={setUserInput}
                onAnalyze={handleAnalyze}
                loading={loading}
              />
              
              {/* Cache Controls */}
              <div className={`mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                <div className="flex items-center gap-4">
                  <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}>
                    <input
                      type="checkbox"
                      checked={useCache}
                      onChange={(e) => setUseCache(e.target.checked)}
                      className="rounded border-gray-400"
                    />
                    <span>Use cache</span>
                  </label>
                  <button
                    onClick={handleClearCache}
                    className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors flex items-center gap-1`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Clear cache
                  </button>
                </div>
              </div>
            </div>

            {/* Collapsible Quick Groups - Below Input */}
            <div className="mb-8">
              <button
                onClick={() => setQuickGroupsExpanded(!quickGroupsExpanded)}
                className={`w-full flex items-center justify-between p-3 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors`}
              >
                <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quick Start Groups
                </span>
                {quickGroupsExpanded ? (
                  <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>
              
              {quickGroupsExpanded && (
                <div className="mt-4">
                  <QuickGroups 
                    onLoadGroup={(usernames) => setUserInput(usernames.replace(/,/g, '\n'))}
                    currentInput={userInput}
                  />
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Loading State with Animated Progress Bar */}
            {loading && (
              <LoadingState 
                progress={progress}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Results Section */}
            <div ref={resultsRef}>
              {!loading && results && (
                <div className="space-y-6">
                  <FilterControls
                    filters={filters}
                    setFilters={setFilters}
                    maxFollowers={Math.max(...results.map(r => r.followers_count))}
                    totalResults={filteredAndSortedResults.length}
                    onExport={exportToCsv}
                    onReset={resetFilters}
                    totalUnfilteredResults={results.length}
                  />
                  
                  {filteredAndSortedResults.length > 0 ? (
                    <EnhancedResultsTable
                      results={filteredAndSortedResults}
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  ) : (
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <Users className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mx-auto mb-3`} />
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-lg mb-4`}>
                        No results match your filters
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Dashboard 
            analysisHistory={analysisHistory}
            currentResults={results}
            onLoadAnalysis={handleLoadAnalysis}
            onClearHistory={() => {
              setAnalysisHistory([]);
              localStorage.removeItem('analysisHistory');
              showNotification('History cleared', 'info');
            }}
          />
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b p-6`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About Signal Hunter</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
                >
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <section>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What is Signal Hunter?</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  Signal Hunter is a powerful tool for discovering high-quality Twitter/X accounts that are followed by multiple experts in your field. 
                  Instead of relying on follower counts alone, we analyze the networks of thought leaders to find hidden gems—accounts with 
                  exceptional content but relatively small followings.
                </p>
              </section>

              <section>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h3>
                <ol className={`list-decimal list-inside space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>Enter usernames of experts or thought leaders in any field</li>
                  <li>Our algorithm analyzes who these experts follow</li>
                  <li>We identify accounts followed by multiple experts (overlap)</li>
                  <li>Filter and sort to find the most promising hidden gems</li>
                  <li>Export your findings or save them for later</li>
                </ol>
              </section>

              <section>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Features</h3>
                <ul className={`list-disc list-inside space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li><strong>Smart Overlap Analysis:</strong> Find accounts trusted by multiple experts</li>
                  <li><strong>Advanced Filtering:</strong> Filter by followers, verification status, bio content, and more</li>
                  <li><strong>Location Insights:</strong> See geographic distribution with interactive map visualization</li>
                  <li><strong>Quick Groups:</strong> Pre-defined expert lists for various industries</li>
                  <li><strong>Export Functionality:</strong> Download results as CSV for further analysis</li>
                  <li><strong>Analysis History:</strong> Track and revisit your previous searches</li>
                  <li><strong>Cache System:</strong> Faster repeated analyses with intelligent caching</li>
                </ul>
              </section>

              <section>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Use Cases</h3>
                <ul className={`list-disc list-inside space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li><strong>Content Discovery:</strong> Find high-quality content creators before they become mainstream</li>
                  <li><strong>Network Building:</strong> Connect with rising stars in your industry</li>
                  <li><strong>Research:</strong> Identify key voices and emerging trends in any field</li>
                  <li><strong>Investment:</strong> Discover founders and builders early</li>
                  <li><strong>Learning:</strong> Find educational content from domain experts</li>
                </ul>
              </section>

              <section>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Privacy & Data</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                  Signal Hunter respects user privacy. We only analyze publicly available follow relationships on Twitter/X. 
                  No personal data is stored on our servers. All analysis history is saved locally in your browser and can 
                  be cleared at any time. We use caching to improve performance, which can also be cleared whenever needed.
                </p>
              </section>

              <section>
                <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tips for Best Results</h3>
                <ul className={`list-disc list-inside space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>Start with 3-5 well-known experts in your field</li>
                  <li>Use minimum overlap of 2-3 for broader results, 4+ for higher confidence</li>
                  <li>Combine verified and unverified accounts for comprehensive discovery</li>
                  <li>Export interesting finds before they gain massive followings</li>
                  <li>Check the "Active Recently" filter to find currently engaged accounts</li>
                </ul>
              </section>

              <section className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Signal Hunter • Version 1.0 • Built with React & Tailwind CSS
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;