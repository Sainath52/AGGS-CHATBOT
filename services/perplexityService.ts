// Service to fetch answers from Perplexity AI website
export async function fetchPerplexityAnswer(query: string): Promise<string> {
  const url = `http://localhost:5174/perplexity?q=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.answer) {
      return data.answer;
    }
    return 'No answer found.';
  } catch (error) {
    return 'Error fetching answer.';
  }
}
