import axios from 'axios';

// Simple network test
export const testNetworkConnection = async () => {
  try {
    // Test with a simple HTTPS endpoint first
    console.log('Testing basic network connectivity...');
    const response = await fetch('https://www.google.com');
    console.log('Google test successful, status:', response.status);
    
    // Test different Supabase endpoints
    console.log('Testing Supabase base URL...');
    try {
      const baseResponse = await fetch('https://stcvjnmqrdsvwvfhgudu.supabase.co');
      console.log('Supabase base URL status:', baseResponse.status);
    } catch (e: any) {
      console.error('Base URL failed:', e.message);
    }
    
    // Try auth endpoint directly
    console.log('Testing Supabase auth endpoint...');
    try {
      const authResponse = await fetch('https://stcvjnmqrdsvwvfhgudu.supabase.co/auth/v1/health', {
        method: 'GET',
      });
      console.log('Supabase auth health status:', authResponse.status);
    } catch (e: any) {
      console.error('Auth endpoint failed:', e.message);
    }
    
    // Test with different headers
    console.log('Testing Supabase with minimal headers...');
    try {
      const minimalResponse = await fetch('https://stcvjnmqrdsvwvfhgudu.supabase.co/rest/v1/');
      console.log('Minimal headers status:', minimalResponse.status);
    } catch (e: any) {
      console.error('Minimal headers failed:', e.message);
    }
    
    // Test with axios
    console.log('Testing Supabase with axios...');
    try {
      const axiosResponse = await axios.get('https://stcvjnmqrdsvwvfhgudu.supabase.co/rest/v1/', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0Y3Zqbm1xcmRzdnd2ZmhndWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODc4NDUsImV4cCI6MjA3MTE2Mzg0NX0.RN0Ci87SWW38uguIkN0RcVsbeDoGsDAxoHRf3Wu9teA',
        }
      });
      console.log('Axios test successful, status:', axiosResponse.status);
      console.log('Axios response data:', axiosResponse.data);
    } catch (e: any) {
      console.error('Axios test failed:', e.message);
      if (e.response) {
        console.error('Axios error response:', e.response.status, e.response.data);
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Network test failed:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Full error:', error);
    return false;
  }
};