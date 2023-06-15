const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json());

class NumbersAPIView {
  static async get(req, res) {
    try {
      const urls = req.query.url;
      const numbers = new Set();

      for (const url of urls) {
        try {
          const response = await axios.get(url, { timeout: 500 });

          if (response.status === 200) {
            const data = response.data;
            const receivedNumbers = data.numbers || [];
            receivedNumbers.forEach(number => numbers.add(number));
          }
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            // Timeout error, continue to the next URL
            continue;
          }
          console.error(`Error fetching data from URL ${url}:`, error.message);
        }
      }

      const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
      return res.status(200).json({ numbers: sortedNumbers });
    } catch (error) {
      console.error('Error processing request:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

app.get('/numbers', NumbersAPIView.get);

const port = 3000;
app.listen(port, () => {
  console.log(`number-management-service is running on port ${port}`);
});
