
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 5174;

app.use(cors());

app.get('/perplexity', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing query' });
  const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const html = await response.text();
  const match = html.match(/<div[^>]*class=["'][^"']*answer-snippet[^"']*["'][^>]*>(.*?)<\/div>/);
    if (match && match[1]) {
      const answer = match[1].replace(/<[^>]+>/g, '').trim();
      return res.json({ answer });
    }
    return res.json({ answer: 'No answer found.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching answer.' });
  }
});

app.listen(PORT, () => {
  console.log(`Perplexity proxy server running on http://localhost:${PORT}`);
});

