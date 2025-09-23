// Utility function to clear all localStorage data
// This ensures the application uses only database data

export const clearAllLocalStorage = () => {
  try {
    // Clear specific Rebels Sports localStorage keys
    const keysToRemove = [
      'rebelsClasses',
      'rebelsRegistrations', 
      'rebelsServices',
      'adminAuthenticated',
      'fitzoneClasses' // Legacy key
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('✅ All Rebels Sports localStorage data cleared');
    console.log('🗑️ Removed keys:', keysToRemove);
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing localStorage:', error);
    return false;
  }
};

// Function to check what localStorage data exists
export const checkLocalStorageData = () => {
  const relevantKeys = [
    'rebelsClasses',
    'rebelsRegistrations', 
    'rebelsServices',
    'adminAuthenticated',
    'fitzoneClasses'
  ];

  console.log('📊 Current localStorage data:');
  relevantKeys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      console.log(`${key}:`, JSON.parse(data));
    } else {
      console.log(`${key}: (not found)`);
    }
  });
};

// Run this in browser console to clear localStorage
if (typeof window !== 'undefined') {
  window.clearRebelsLocalStorage = clearAllLocalStorage;
  window.checkRebelsLocalStorage = checkLocalStorageData;
}