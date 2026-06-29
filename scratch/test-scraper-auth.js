
async function testAuth() {
  const url = 'https://www.tecbunny.com/api/products/scraper';
  
  const payload = {
    title: 'Test Diagnostic Product',
    price: '₹999.00',
    description: 'This is a test to verify API configuration and authentication.',
    imageUrl: 'https://m.media-amazon.com/images/I/71Ip8L99D1L._SL1500_.jpg',
    sourceUrl: 'https://www.amazon.in/dp/B09W2ZWLNQ'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-superadmin-username': 'Shubham6010',
        'x-superadmin-password': 'Bunny@6010'
      },
      body: JSON.stringify(payload)
    });

    const status = response.status;
    const body = await response.text();
    console.log('Status Code:', status);
    console.log('Response Body:', body);
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

testAuth();
