import axios from 'axios';

export interface WikipediaResponse {
  text: string;
  url?: string;
}

export const getWikipediaSummary = async (question: string, lang: string = 'en'): Promise<WikipediaResponse> => {
  try {
    // Use the first 5 words of the question as the search query
    const query = encodeURIComponent(question.split(' ').slice(0, 5).join(' '));
    // Use the language code (e.g., 'en', 'hi', 'fr') for the Wikipedia API
    const langCode = lang.split('-')[0];
    const searchUrl = `https://${langCode}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json&origin=*`;
    const searchRes = await axios.get(searchUrl);
    const searchResults = searchRes.data.query.search;
    if (!searchResults || searchResults.length === 0) {
      // Fallback to English if not found in selected language
      if (langCode !== 'en') {
        return getWikipediaSummary(question, 'en');
      }
      return { text: 'No relevant Wikipedia article found.' };
    }
    const pageTitle = searchResults[0].title;
    const summaryUrl = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const summaryRes = await axios.get(summaryUrl);
    const summary = summaryRes.data.extract;
    const url = summaryRes.data.content_urls?.desktop?.page;
    return { text: summary, url };
  } catch (error) {
    // Fallback to English if not found in selected language
    if (lang && lang.split('-')[0] !== 'en') {
      return getWikipediaSummary(question, 'en');
    }
    return { text: 'Sorry, there was an error fetching information from Wikipedia.' };
  }
};
