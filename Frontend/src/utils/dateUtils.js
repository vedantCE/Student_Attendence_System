export const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return '';
  
  // Check if date is already in dd/mm/yyyy format
  if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const parts = dateString.split('/');
    // If first part > 12, it's already dd/mm/yyyy
    if (parseInt(parts[0]) > 12) {
      return dateString;
    }
    // If second part > 12, it's mm/dd/yyyy, convert it
    if (parseInt(parts[1]) > 12) {
      return `${parts[1]}/${parts[0]}/${parts[2]}`;
    }
    // Ambiguous case, assume it's mm/dd/yyyy and convert
    return `${parts[1]}/${parts[0]}/${parts[2]}`;
  }
  
  return dateString;
};