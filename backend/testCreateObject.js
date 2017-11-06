var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
var gitHubToken = process.env.GIT_HUB_KEY; //""
var esGithubWriter = require("github-es");
var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)


writer.synchronizeIndividualPRs(
    [
        {
            owner: 'magento-engcom',
            repo: 'msi',
            number: '38'
        },
        {
            owner: 'magento-engcom',
            repo: 'msi',
            number: '49'
        },
    ]
);