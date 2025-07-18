// Tag color utility functions
export const getTagColorClass = (tag: string): string => {
  // All tags now use the same color: #00bcff
  return `tag-color-1`;
};

export const getTagColorStyle = (tag: string): { backgroundColor: string; color: string } => {
  // All tags now use the same color: #00bcff
  return { backgroundColor: '#00bcff', color: 'white' };
};

// All tags now use the same color: #00bcff
export const getSpecificTagColor = (tag: string): string => {
  // All tags use the same color class
  return 'tag-color-1';
};
