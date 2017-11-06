import prsLoaderFactory from "./aggregators/created.js"

client.loadData({
    index: 'github-prs-metadata',
    type: 'github-pr-metadata',
    size: 1000,
    body: {
        "query": {
            "match_all":{}
        }
    }
}, response => {
    response.hits.hits.forEach(
        hit => {
            
        }
    )
}, hitsTotal => {
    return hitsTotal > this.prsCount
})
