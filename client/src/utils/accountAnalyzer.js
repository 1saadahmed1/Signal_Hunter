export const accountCategories = {
  founder: {
    keywords: ['founder', 'co-founder', 'ceo', 'building', 'startup', 'launching'],
    color: '#FF6B6B',
    label: 'Founder'
  },
  investor: {
    keywords: ['vc', 'investor', 'partner at', 'investing', 'angel', 'portfolio'],
    color: '#4ECDC4',
    label: 'Investor'
  },
  engineer: {
    keywords: ['engineer', 'developer', 'programmer', 'coding', 'software', 'tech lead'],
    color: '#45B7D1',
    label: 'Engineer'
  },
  researcher: {
    keywords: ['phd', 'researcher', 'professor', 'research', 'scientist', 'academic'],
    color: '#96CEB4',
    label: 'Researcher'
  },
  writer: {
    keywords: ['writer', 'author', 'writing', 'newsletter', 'journalist', 'editor'],
    color: '#DDA0DD',
    label: 'Writer'
  },
  designer: {
    keywords: ['designer', 'design', 'ux', 'ui', 'product design', 'creative'],
    color: '#FFD93D',
    label: 'Designer'
  }
};

export function categorizeAccount(description) {
  if (!description) return [];
  
  const lowerDesc = description.toLowerCase();
  const categories = [];
  
  for (const [category, config] of Object.entries(accountCategories)) {
    if (config.keywords.some(keyword => lowerDesc.includes(keyword))) {
      categories.push(category);
    }
  }
  
  return categories;
}

export function calculateGemScore(account) {
  // Follower/Following ratio (higher is better for influence)
  const followerRatio = account.followers_count / Math.max(account.following_count, 1);
  const normalizedRatio = Math.min(followerRatio / 10, 1); // Normalize to 0-1
  
  // Overlap score (how many experts follow them)
  const overlapScore = account.overlap_percentage / 100;
  
  // Hidden gem bonus (lower followers = more hidden)
  let hiddenBonus = 0;
  if (account.followers_count < 1000) hiddenBonus = 0.3;
  else if (account.followers_count < 5000) hiddenBonus = 0.2;
  else if (account.followers_count < 10000) hiddenBonus = 0.1;
  
  // Bio quality (has description)
  const bioScore = account.description && account.description.length > 50 ? 0.1 : 0;
  
  // Calculate weighted score
  const gemScore = (
    overlapScore * 0.4 +      // 40% weight on expert overlap
    normalizedRatio * 0.2 +    // 20% weight on follower ratio
    hiddenBonus * 0.3 +        // 30% weight on being hidden
    bioScore * 0.1             // 10% weight on bio quality
  );
  
  return {
    score: Math.round(gemScore * 100),
    components: {
      overlap: Math.round(overlapScore * 100),
      influence: Math.round(normalizedRatio * 100),
      hiddenGem: Math.round(hiddenBonus * 100),
      bioQuality: Math.round(bioScore * 100)
    }
  };
}

export function getGemTier(gemScore) {
  if (gemScore >= 80) return { tier: 'S', color: '#FFD700', label: 'Legendary Gem' };
  if (gemScore >= 70) return { tier: 'A', color: '#C0C0C0', label: 'Rare Gem' };
  if (gemScore >= 60) return { tier: 'B', color: '#CD7F32', label: 'Hidden Gem' };
  if (gemScore >= 50) return { tier: 'C', color: '#45B7D1', label: 'Rising Talent' };
  return { tier: 'D', color: '#808080', label: 'Potential' };
}