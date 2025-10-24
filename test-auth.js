// Test script to debug Tekmetric auth
async function testTekmetricAuth() {
  try {
    console.log('Testing Tekmetric authentication...');
    
    const response = await fetch('https://svxcvsrvqhpuadhfeyen.supabase.co/functions/v1/debug-auth', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2eGN2c3J2cWhwdWFkaGZleWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMzI0NTQsImV4cCI6MjA3MjkwODQ1NH0.tHWD8kA0WNAplP-bi-YNY9qNYn78QPhooLHE2G5V_g0',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Auth test results:', {
      status: response.status,
      data: data
    });
    
    return data;
  } catch (error) {
    console.error('Auth test failed:', error);
    return { error: error.message };
  }
}

// Run the test
testTekmetricAuth().then(result => {
  console.log('Final result:', result);
});