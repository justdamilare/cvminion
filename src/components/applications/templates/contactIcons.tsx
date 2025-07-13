/**
 * Contact icons using Unicode symbols for React PDF compatibility
 */
export const ContactIcons = {
  phone: '📞', // Alternative: '☎' or '✆'
  email: '✉', // Alternative: '📧' or '@'
  address: '📍', // Alternative: '🏠' or '📌' 
  website: '🌐', // Alternative: '🔗' or '⭐'
  linkedin: '💼', // Alternative: 'in' or '🔗'
} as const;

/**
 * Simple contact icons using basic symbols
 */
export const SimpleContactIcons = {
  phone: 'T:',
  email: '@',
  address: '•',
  website: 'W:',
  linkedin: 'in:',
} as const;

/**
 * Minimal contact icons using text symbols
 */
export const MinimalContactIcons = {
  phone: 'T:',
  email: 'E:',
  address: 'A:',
  website: 'W:',
  linkedin: 'L:',
} as const;

/**
 * Get contact display with icon
 */
export const getContactWithIcon = (
  type: keyof typeof ContactIcons,
  value: string,
  iconSet: 'default' | 'simple' | 'minimal' = 'default'
): string => {
  if (!value) return '';
  
  let icon: string;
  switch (iconSet) {
    case 'simple':
      icon = SimpleContactIcons[type];
      break;
    case 'minimal':
      icon = MinimalContactIcons[type];
      break;
    default:
      icon = ContactIcons[type];
  }
  
  return `${icon} ${value}`;
};

/**
 * Clean LinkedIn URL for display
 */
export const cleanLinkedInUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}; 
