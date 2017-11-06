var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
var gitHubToken = process.env.GIT_HUB_KEY; //""
var esGithubWriter = require("github-es");
var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)


//writer.synchronizeTeams('vrann-acme');


writer.synchronizeIndividualTeam([2485555]).then(console.log).catch(console.log)


// var repoRequest = {
//     owner: 'vrann-acme',
//     repo: 'test', 
//     number: 1
//     // state: 'open',
//     // sort: 'updated',
//     // direction: 'desc'
// }
// writer.synchronizeIndividualPRs([repoRequest]);