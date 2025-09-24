import React, { useState } from 'react';
import { 
  Zap, 
  Code, 
  DollarSign, 
  Brain, 
  Briefcase,
  Globe,
  Rocket,
  Users,
  ChevronRight,
  Plus
} from 'lucide-react';

const EXPERT_GROUPS = {
  techFounders: {
    name: 'Tech Founders',
    description: 'Silicon Valley pioneers and innovators',
    icon: Rocket,
    color: 'from-blue-500 to-indigo-600',
    usernames: 'elonmusk,jeffbezos,billgates,sundarpichai,tim_cook',
    experts: ['elonmusk', 'jeffbezos', 'billgates', 'sundarpichai', 'tim_cook'],
    stats: { followers: '450M+', overlap: 'High' }
  },
  aiResearchers: {
    name: 'AI Researchers',
    description: 'Leading minds in artificial intelligence',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    usernames: 'sama,karpathy,ylecun,geoffreyhinton,demishassabis,ilyasut',
    experts: ['sama', 'karpathy', 'ylecun', 'geoffreyhinton', 'demishassabis'],
    stats: { followers: '5M+', overlap: 'Very High' }
  },
  ventureCapitalists: {
    name: 'VCs & Investors',
    description: 'Top venture capitalists and angel investors',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-600',
    usernames: 'pmarca,reid,chamath,naval,paulg,jason,benedictevans',
    experts: ['pmarca', 'reid', 'chamath', 'naval', 'paulg'],
    stats: { followers: '15M+', overlap: 'High' }
  },
  cryptoLeaders: {
    name: 'Crypto Leaders',
    description: 'Blockchain and Web3 innovators',
    icon: Globe,
    color: 'from-orange-500 to-yellow-600',
    usernames: 'vitalikbuterin,cz_binance,brian_armstrong,aantonop,balajis,cdixon',
    experts: ['vitalikbuterin', 'cz_binance', 'brian_armstrong', 'balajis'],
    stats: { followers: '20M+', overlap: 'Medium' }
  },
  productBuilders: {
    name: 'Product Builders',
    description: 'Product managers and designers',
    icon: Code,
    color: 'from-cyan-500 to-blue-600',
    usernames: 'jasonfried,dhh,patio11,levie,stewart,tobias',
    experts: ['jasonfried', 'dhh', 'patio11', 'levie', 'stewart'],
    stats: { followers: '3M+', overlap: 'High' }
  },
  thoughtLeaders: {
    name: 'Thought Leaders',
    description: 'Influential thinkers and writers',
    icon: Briefcase,
    color: 'from-gray-600 to-gray-800',
    usernames: 'paulkrugman,tylercowen,mattyglesias,ezraklein,natesilver538',
    experts: ['paulkrugman', 'tylercowen', 'mattyglesias', 'ezraklein'],
    stats: { followers: '10M+', overlap: 'Medium' }
  }
};

export function QuickGroups({ onLoadGroup, currentInput }) {
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [customGroup, setCustomGroup] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleGroupClick = (groupKey) => {
    const group = EXPERT_GROUPS[groupKey];
    setSelectedGroup(groupKey);
    onLoadGroup(group.usernames);
    
    // Animate the selection
    setTimeout(() => {
      setSelectedGroup(null);
    }, 1000);
  };

  const handleCustomGroup = () => {
    if (customGroup.trim()) {
      onLoadGroup(customGroup);
      setCustomGroup('');
      setShowCustom(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Quick Start Groups</h3>
            <p className="text-sm text-blue-300">Select a pre-configured expert group or create your own</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Custom Group
        </button>
      </div>

      {/* Custom Group Input */}
      {showCustom && (
        <div className="mb-4 p-4 bg-white/10 rounded-xl border border-white/20 animate-slide-down">
          <div className="flex gap-2">
            <input
              type="text"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomGroup()}
              placeholder="Enter usernames separated by commas..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300"
            />
            <button
              onClick={handleCustomGroup}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Load
            </button>
          </div>
        </div>
      )}

      {/* Expert Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(EXPERT_GROUPS).map(([key, group]) => {
          const Icon = group.icon;
          const isHovered = hoveredGroup === key;
          const isSelected = selectedGroup === key;
          
          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredGroup(key)}
              onMouseLeave={() => setHoveredGroup(null)}
              onClick={() => handleGroupClick(key)}
              className={`
                relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform
                ${isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'}
                ${isSelected ? 'scale-95 ring-4 ring-white/50' : ''}
              `}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${group.color} opacity-90`} />
              
              {/* Animated Background Pattern */}
              {isHovered && (
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-white/10 animate-slide" />
                </div>
              )}
              
              {/* Content */}
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected && (
                    <div className="px-2 py-1 bg-white/20 rounded text-xs animate-pulse">
                      Loading...
                    </div>
                  )}
                </div>
                
                <h4 className="text-lg font-bold mb-2">{group.name}</h4>
                <p className="text-sm text-white/80 mb-4">{group.description}</p>
                
                {/* Expert Preview */}
                <div className="flex -space-x-2 mb-4">
                  {group.experts.slice(0, 4).map((expert, i) => (
                    <div
                      key={expert}
                      className="w-8 h-8 bg-white/20 rounded-full border-2 border-white/40 flex items-center justify-center text-xs font-bold"
                      style={{ zIndex: 4 - i }}
                    >
                      {expert[0].toUpperCase()}
                    </div>
                  ))}
                  {group.experts.length > 4 && (
                    <div className="w-8 h-8 bg-white/30 rounded-full border-2 border-white/40 flex items-center justify-center text-xs">
                      +{group.experts.length - 4}
                    </div>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">
                    <Users className="w-3 h-3 inline mr-1" />
                    {group.stats.followers}
                  </span>
                  <span className="text-white/60">
                    Overlap: {group.stats.overlap}
                  </span>
                </div>
                
                {/* Hover Effect Arrow */}
                <div className={`absolute right-4 bottom-4 transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}`}>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}