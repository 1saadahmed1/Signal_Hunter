import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Sparkles, Users, Command } from 'lucide-react';

const POPULAR_EXPERTS = [
  // Tech
  { username: 'elonmusk', category: 'Tech', followers: '226M' },
  { username: 'jeffbezos', category: 'Tech', followers: '6M' },
  { username: 'sundarpichai', category: 'Tech', followers: '2M' },
  { username: 'satyanadella', category: 'Tech', followers: '2M' },
  { username: 'tim_cook', category: 'Tech', followers: '14M' },
  
  // AI/ML
  { username: 'sama', category: 'AI', followers: '2.5M' },
  { username: 'karpathy', category: 'AI', followers: '800K' },
  { username: 'ylecun', category: 'AI', followers: '500K' },
  { username: 'geoffreyhinton', category: 'AI', followers: '100K' },
  
  // Venture/Finance
  { username: 'paulg', category: 'VC', followers: '1.5M' },
  { username: 'naval', category: 'VC', followers: '2M' },
  { username: 'patrickc', category: 'VC', followers: '300K' },
  { username: 'balajis', category: 'VC', followers: '900K' },
  { username: 'pmarca', category: 'VC', followers: '1M' },
  { username: 'chamath', category: 'VC', followers: '1.5M' },
  
  // Crypto
  { username: 'vitalikbuterin', category: 'Crypto', followers: '5M' },
  { username: 'cz_binance', category: 'Crypto', followers: '8M' },
  { username: 'brian_armstrong', category: 'Crypto', followers: '1M' },
];

export function InputSection({ userInput, setUserInput, onAnalyze, loading }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsernames, setSelectedUsernames] = useState(new Set());
  const [isCommandMode, setIsCommandMode] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Parse existing userInput to selected usernames
    const usernames = userInput.split(/[\n,]/).map(u => u.trim()).filter(Boolean);
    setSelectedUsernames(new Set(usernames));
  }, [userInput]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + K to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandMode(true);
        textareaRef.current?.focus();
      }
      // Escape to close suggestions
      if (e.key === 'Escape') {
        setShowSuggestions(false);
        setIsCommandMode(false);
      }
      // Cmd/Ctrl + Enter to analyze
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !loading) {
        onAnalyze();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loading, onAnalyze]);

  const filteredSuggestions = POPULAR_EXPERTS.filter(expert => 
    expert.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsernames.has(expert.username)
  );

  const handleAddUsername = (username) => {
    const newSet = new Set(selectedUsernames);
    newSet.add(username);
    setSelectedUsernames(newSet);
    setUserInput(Array.from(newSet).join('\n'));
    setSearchTerm('');
  };

  const handleRemoveUsername = (username) => {
    const newSet = new Set(selectedUsernames);
    newSet.delete(username);
    setSelectedUsernames(newSet);
    setUserInput(Array.from(newSet).join('\n'));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const usernames = pastedText.split(/[\n,\s]+/).map(u => u.trim().replace('@', '')).filter(Boolean);
    const newSet = new Set([...selectedUsernames, ...usernames]);
    setSelectedUsernames(newSet);
    setUserInput(Array.from(newSet).join('\n'));
  };

  const categoryColors = {
    Tech: 'from-blue-500 to-indigo-500',
    AI: 'from-purple-500 to-pink-500',
    VC: 'from-green-500 to-emerald-500',
    Crypto: 'from-orange-500 to-yellow-500',
  };

  return (
    <div className="space-y-4">
      {/* Selected Users Pills */}
      {selectedUsernames.size > 0 && (
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-300">
              Selected Experts ({selectedUsernames.size})
            </span>
            <button
              onClick={() => {
                setSelectedUsernames(new Set());
                setUserInput('');
              }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedUsernames).map(username => (
              <span
                key={username}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-sm text-white"
              >
                @{username}
                <button
                  onClick={() => handleRemoveUsername(username)}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative">
        <div className="absolute left-3 top-3 text-blue-400">
          <Users className="w-5 h-5" />
        </div>
        {isCommandMode && (
          <div className="absolute right-3 top-3 flex items-center gap-1 text-xs bg-blue-600/20 px-2 py-1 rounded">
            <Command className="w-3 h-3" />
            <span>Command Mode</span>
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onPaste={handlePaste}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Enter Twitter usernames (one per line or comma-separated)&#10;&#10;Example:&#10;naval&#10;paulg&#10;elonmusk&#10;&#10;Or press Cmd+K for quick add"
          className="w-full pl-10 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all resize-none font-mono"
          rows="6"
          disabled={loading}
        />

        {/* Keyboard Shortcuts Help */}
        <div className="absolute bottom-2 right-2 flex gap-2 text-xs text-blue-400">
          <span className="px-2 py-1 bg-white/5 rounded">⌘+K Quick Add</span>
          <span className="px-2 py-1 bg-white/5 rounded">⌘+Enter Analyze</span>
        </div>
      </div>

      {/* Auto-suggestions Dropdown */}
      {showSuggestions && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Popular Experts
            </h4>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredSuggestions.map(expert => (
              <button
                key={expert.username}
                onClick={() => handleAddUsername(expert.username)}
                className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-8 bg-gradient-to-b ${categoryColors[expert.category]} rounded-full`} />
                  <div className="text-left">
                    <p className="text-sm text-white">@{expert.username}</p>
                    <p className="text-xs text-blue-300">{expert.followers} followers</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <p className="text-center text-blue-300 text-sm py-4">
              No suggestions found
            </p>
          )}
        </div>
      )}

      {/* Analyze Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-blue-300">
          {selectedUsernames.size > 0 && (
            <>
              Ready to analyze <span className="font-bold text-white">{selectedUsernames.size}</span> experts
            </>
          )}
        </div>
        
        <button
          onClick={onAnalyze}
          disabled={loading || selectedUsernames.size < 2}
          data-analyze-button
          className={`
            px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2
            ${loading || selectedUsernames.size < 2
              ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          <Search className="w-5 h-5" />
          {loading ? 'Analyzing...' : 'Analyze Network'}
        </button>
      </div>
    </div>
  );
}