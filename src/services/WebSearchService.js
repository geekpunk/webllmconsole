export const WebSearchService = {
    search: async (query, provider = 'wikipedia', config = {}) => {
        if (provider === 'google') {
            return WebSearchService.searchGoogle(query, config.apiKey, config.cx);
        } else {
            return WebSearchService.searchWikipedia(query);
        }
    },

    searchWikipedia: async (query) => {
        try {
            const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=3&srsearch=${encodeURIComponent(query)}`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (!data.query || !data.query.search) return [];

            return data.query.search.map(result => ({
                title: result.title,
                snippet: result.snippet.replace(/<[^>]*>/g, ''), // Strip HTML tags
                url: `https://en.wikipedia.org/?curid=${result.pageid}`,
                source: 'Wikipedia'
            }));
        } catch (error) {
            console.error('Wikipedia search failed', error);
            return [];
        }
    },

    searchGoogle: async (query, apiKey, cx) => {
        if (!apiKey || !cx) {
            console.warn('Google Search requires API Key and CX');
            return [];
        }

        try {
            const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (!data.items) return [];

            return data.items.slice(0, 3).map(item => ({
                title: item.title,
                snippet: item.snippet,
                url: item.link,
                source: 'Google'
            }));
        } catch (error) {
            console.error('Google search failed', error);
            return [];
        }
    }
};
