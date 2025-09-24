export function parseUsernames(input) {
  if (!input) return [];
  
  // Remove @ symbols and clean up
  const cleaned = input.replace(/@/g, '');
  
  // Split by commas, newlines, or spaces
  const usernames = [];
  const tokens = cleaned.split(/[\n,\s]+/);
  
  tokens.forEach(token => {
    const username = token.trim();
    if (username && username.length > 0) {
      usernames.push(username);
    }
  });
  
  // Remove duplicates
  return [...new Set(usernames)];
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}