import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Users, 
  TrendingUp,
  Search,
  X,
  CheckCircle,
  Clock,
  MessageSquare,
  Globe
} from 'lucide-react';

export function FilterControls({ 
  filters, 
  setFilters, 
  maxFollowers, 
  totalResults, 
  onExport, 
  onReset,
  totalUnfilteredResults,
  results 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({
    verifiedOnly: false,
    hasBio: false,
    activeRecently: false,
    englishOnly: false
  });

  // Apply filters whenever they change
  useEffect(() => {
    if (setFilters) {
      setFilters(prev => ({
        ...prev,
        ...advancedFilters,
        searchQuery
      }));
    }
  }, [advancedFilters, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAdvancedFilter = (filterName) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Filter className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Filters & Search</h3>
            <p className="text-sm text-blue-300">
              Showing {totalResults} of {totalUnfilteredResults} results
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg transition-colors"
            title="Reset filters"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by username or bio..."
            className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Filters - Fixed Layout with proper spacing */}
      <div className="space-y-6 mb-6">
        {/* First Row: Followers Range */}
        <div className="w-full">
          <label className="text-sm font-medium text-blue-200 flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" />
            Followers Range
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={filters.minFollowers}
              onChange={(e) => handleFilterChange('minFollowers', parseInt(e.target.value) || 0)}
              placeholder="Min"
              className="flex-1 max-w-[200px] px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <span className="text-white">to</span>
            <input
              type="number"
              value={filters.maxFollowers}
              onChange={(e) => handleFilterChange('maxFollowers', parseInt(e.target.value) || 10000000)}
              placeholder="Max"
              className="flex-1 max-w-[200px] px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <div className="text-xs text-blue-300 ml-4">
              Current: {formatNumber(filters.minFollowers)} - {formatNumber(filters.maxFollowers)}
            </div>
          </div>
        </div>

        {/* Second Row: Minimum Overlap and Quick Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Minimum Overlap */}
          <div>
            <label className="text-sm font-medium text-blue-200 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" />
              Minimum Overlap
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={filters.minOverlap}
                onChange={(e) => handleFilterChange('minOverlap', parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <div className="min-w-[100px] px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center">
                {filters.minOverlap} experts
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="text-sm font-medium text-blue-200 mb-3 block">Quick Presets</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFilters({ 
                  ...filters,
                  minFollowers: 0, 
                  maxFollowers: 10000, 
                  minOverlap: 3 
                })}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg text-xs transition-colors"
              >
                Ultra Hidden
              </button>
              <button
                onClick={() => setFilters({ 
                  ...filters,
                  minFollowers: 10000, 
                  maxFollowers: 50000, 
                  minOverlap: 2 
                })}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg text-xs transition-colors"
              >
                Rising Stars
              </button>
              <button
                onClick={() => setFilters({ 
                  ...filters,
                  minFollowers: 0, 
                  maxFollowers: 100000, 
                  minOverlap: 4 
                })}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg text-xs transition-colors"
              >
                High Trust
              </button>
              <button
                onClick={() => setFilters({ 
                  ...filters,
                  minFollowers: 0, 
                  maxFollowers: 10000000, 
                  minOverlap: 2 
                })}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg text-xs transition-colors"
              >
                Show All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Checkboxes */}
      <div className="border-t border-white/10 pt-6">
        <h4 className="text-sm font-medium text-blue-200 mb-4">Advanced Filters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox"
              checked={advancedFilters.verifiedOnly}
              onChange={() => handleAdvancedFilter('verifiedOnly')}
              className="w-5 h-5 rounded border-2 border-blue-400 bg-transparent checked:bg-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
            />
            <span className="text-sm text-blue-300 group-hover:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Verified Only
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox"
              checked={advancedFilters.hasBio}
              onChange={() => handleAdvancedFilter('hasBio')}
              className="w-5 h-5 rounded border-2 border-blue-400 bg-transparent checked:bg-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
            />
            <span className="text-sm text-blue-300 group-hover:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Has Bio
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox"
              checked={advancedFilters.activeRecently}
              onChange={() => handleAdvancedFilter('activeRecently')}
              className="w-5 h-5 rounded border-2 border-blue-400 bg-transparent checked:bg-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
            />
            <span className="text-sm text-blue-300 group-hover:text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Active Recently
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              type="checkbox"
              checked={advancedFilters.englishOnly}
              onChange={() => handleAdvancedFilter('englishOnly')}
              className="w-5 h-5 rounded border-2 border-blue-400 bg-transparent checked:bg-blue-600 focus:ring-2 focus:ring-blue-400 cursor-pointer"
            />
            <span className="text-sm text-blue-300 group-hover:text-white flex items-center gap-2">
              <Globe className="w-4 h-4" />
              English Bios
            </span>
          </label>
        </div>

        {/* Active Filters Display */}
        {Object.entries(advancedFilters).some(([_, value]) => value) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-blue-300">Active filters:</span>
            {advancedFilters.verifiedOnly && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                Verified
              </span>
            )}
            {advancedFilters.hasBio && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                Has Bio
              </span>
            )}
            {advancedFilters.activeRecently && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                Active
              </span>
            )}
            {advancedFilters.englishOnly && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                English
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}