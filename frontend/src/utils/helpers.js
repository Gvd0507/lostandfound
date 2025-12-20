// Format date to readable string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date for input field (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Validate file type
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  return validTypes.includes(file.type);
};

// Validate file size (max 5MB)
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    'pending': 'warning',
    'matched': 'info',
    'verified': 'success',
    'closed': 'success',
    'admin_review': 'error',
    'rejected': 'error'
  };
  return colors[status] || 'default';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pending',
    'matched': 'Match Found',
    'verified': 'Verified',
    'closed': 'Closed',
    'admin_review': 'Admin Review',
    'rejected': 'Rejected'
  };
  return labels[status] || status;
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15);
};
