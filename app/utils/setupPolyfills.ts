// Polyfills for React Native
import 'react-native-url-polyfill/auto';

// Import cross-fetch to polyfill fetch globally
import fetch from 'cross-fetch';

// Setup global configuration
if (typeof global !== 'undefined') {
  // Polyfill fetch
  global.fetch = fetch;
  
  // Ensure we have a proper URL implementation
  if (!global.URL) {
    global.URL = require('react-native-url-polyfill').URL;
  }
  
  // Ensure we have a proper URLSearchParams implementation
  if (!global.URLSearchParams) {
    global.URLSearchParams = require('react-native-url-polyfill').URLSearchParams;
  }
}

export {};