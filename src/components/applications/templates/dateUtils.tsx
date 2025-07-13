/**
 * Formats a date string to show as "01 2023" or "Jan 2023" format
 * @param dateString - The date string to format
 * @param format - Either 'numeric' for "01 2023" or 'short' for "Jan 2023"
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | null | undefined, format: 'numeric' | 'short' = 'short'): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if can't parse
    }
    
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    
    if (format === 'numeric') {
      return `${month.toString().padStart(2, '0')} ${year}`;
    } else {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return `${monthNames[month - 1]} ${year}`;
    }
  } catch {
    return dateString; // Return original on error
  }
};

/**
 * Formats a date range for display
 * @param startDate - Start date string
 * @param endDate - End date string
 * @param format - Date format to use
 * @returns Formatted date range string
 */
export const formatDateRange = (
  startDate: string | null | undefined, 
  endDate: string | null | undefined, 
  format: 'numeric' | 'short' = 'short'
): string => {
  const start = formatDate(startDate, format);
  const end = endDate ? formatDate(endDate, format) : 'Present';
  
  if (!start && !endDate) return '';
  if (!start) return end;
  
  return `${start} - ${end}`;
}; 
