export const getCategoryColor = (category: string): string => {
  const defaultColors: Record<string, string> = {
    Food: '#ff6b6b',
    Transport: '#4ecdc4',
    Software: '#ff9f43',
    'Office Supplies': '#1a535c',
    Marketing: '#ffa07a',
    Utilities: '#6a4c93',
    Travel: '#2e86ab',
    Miscellaneous: '#c0c0c0',
  };

  if (defaultColors[category]) return defaultColors[category];

  // Simple string hash to color
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color (keeping saturation and lightness for aesthetics)
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 65%)`;
};
