
export interface SearchResult {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'aggs';
  imageUrl?: string; // Used for both user uploads and AGGS generations
  searchResults?: SearchResult[];
  lang?: string;
}
