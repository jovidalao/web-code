// Base padding for root level items (after project header)
export const BASE_PADDING = 4;

// Additional padding per nesting level
export const LEVEL_PADDING = 12;

export const getItemPadding = (level: number) => {
  return BASE_PADDING + level * LEVEL_PADDING;
};