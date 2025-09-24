// client/src/components/EnhancedResultsTable.jsx
import React, { useState } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ExternalLink, 
  CheckCircle,
  MapPin,
  Users,
  ChevronRight
} from 'lucide-react';

export function EnhancedResultsTable({ results, sortConfig, onSort }) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [isDarkMode] = useState(() => !document.body.classList.contains('light-mode'));

  const toggleRow = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <div className="w-4 h-4" />;
    }
    return sortConfig.direction === 'desc' 
      ? <ChevronDown className="w-4 h-4" />
      : <ChevronUp className="w-4 h-4" />;
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatLocation = (location) => {
    if (!location || location.trim() === '') return 'Not specified';
    // Truncate long locations
    if (location.length > 25) {
      return location.substring(0, 22) + '...';
    }
    return location;
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold text-blue-200">
                Rank
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-blue-200">
                Username
              </th>

              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-blue-200 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('overlap_count')}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Overlap
                  <SortIcon column="overlap_count" />
                </div>
              </th>
              <th 
                className="px-4 py-4 text-left text-sm font-semibold text-blue-200 cursor-pointer hover:text-white transition-colors"
                onClick={() => onSort('followers_count')}
              >
                <div className="flex items-center gap-2">
                  Followers
                  <SortIcon column="followers_count" />
                </div>
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-blue-200">
                Bio
              </th>
              <th className="px-4 py-4 text-center text-sm font-semibold text-blue-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {results.map((account, index) => (
              <React.Fragment key={account.username}>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRow(index)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <ChevronRight 
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            expandedRows.has(index) ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      <span className="text-sm text-white font-mono">
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            @{account.username}
                          </span>
                          {account.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        {account.name && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {account.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {account.overlap_count} experts
                      </div>
                      <div className="text-xs text-blue-300">
                        {account.overlap_percentage.toFixed(1)}%
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, account.overlap_percentage)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {formatNumber(account.followers_count)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Following: {formatNumber(account.following_count)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    <div className="line-clamp-2 max-w-xs">
                      {account.description || 'No bio available'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <a
                      href={`https://x.com/${account.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-xs">View</span>
                    </a>
                  </td>
                </tr>
                
                {/* Expanded Row - Shows additional details */}
                {expandedRows.has(index) && (
                  <tr className="bg-white/5">
                    <td colSpan="7" className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-semibold text-blue-300 mb-2">
                            Experts Following This Account:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {account.experts_following?.map((expert, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
                              >
                                @{expert}
                              </span>
                            )) || <span className="text-gray-400 text-sm">No data available</span>}
                          </div>
                        </div>
                        
                        {account.description && (
                          <div>
                            <h4 className="text-sm font-semibold text-blue-300 mb-2">
                              Full Bio:
                            </h4>
                            <p className="text-sm text-gray-300">
                              {account.description}
                            </p>
                          </div>
                        )}
                        
                        {account.location && (
                          <div>
                            <h4 className="text-sm font-semibold text-blue-300 mb-2">
                              Full Location:
                            </h4>
                            <p className="text-sm text-gray-300">
                              {account.location}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-semibold text-blue-300 mb-2">
                            Account Stats:
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Followers:</span>
                              <span className="ml-2 text-white">
                                {account.followers_count?.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Following:</span>
                              <span className="ml-2 text-white">
                                {account.following_count?.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Ratio:</span>
                              <span className="ml-2 text-white">
                                {account.following_count > 0 
                                  ? (account.followers_count / account.following_count).toFixed(2)
                                  : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Verified:</span>
                              <span className="ml-2 text-white">
                                {account.verified ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}