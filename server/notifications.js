const axios = require('axios');

const sendNotification = async (message, heading = 'Fiesta de 15') => {
  const options = {
    method: 'POST',
    url: 'https://onesignal.com/api/v1/notifications',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`
    },
    data: {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      contents: { en: message, es: message },
      headings: { en: heading, es: heading }
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('OneSignal Error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { sendNotification };
