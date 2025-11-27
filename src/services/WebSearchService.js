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
            // 1. Search for pages
            const searchEndpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=3&srsearch=${encodeURIComponent(query)}`;
            const searchResponse = await fetch(searchEndpoint);
            const searchData = await searchResponse.json();

            if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) return [];

            const results = searchData.query.search;
            const pageIds = results.map(r => r.pageid).join('|');

            // 2. Fetch extracts for found pages
            const extractsEndpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageIds}&format=json&origin=*`;
            const extractsResponse = await fetch(extractsEndpoint);
            const extractsData = await extractsResponse.json();

            const pages = extractsData.query?.pages || {};

            return results.map(result => {
                const pageDetails = pages[result.pageid];
                // Use the extract if available, otherwise fallback to the search snippet
                const content = pageDetails?.extract || result.snippet.replace(/<[^>]*>/g, '');

                return {
                    title: result.title,
                    snippet: content, // Now contains the intro paragraphs
                    url: `https://en.wikipedia.org/?curid=${result.pageid}`,
                    source: 'Wikipedia'
                };
            });
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
