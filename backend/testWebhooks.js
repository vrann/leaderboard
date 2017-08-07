var modules = require('./index.js')
var testHooks = require('./samples/webhooks/teams.js')
var EsBuilder = require('gitHubEs/esBuilder')
var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
client = EsBuilder(elasticsearchEndpoint)

function sendWebhooks() {
    //create "Acme" team
    modules.acceptWebHook({headers: testHooks.createTeam.headers, body: JSON.stringify(testHooks.createTeam.body)}, {}, console.log);
    //create "Marvelous" team
    modules.acceptWebHook({headers: testHooks.createTeam2.headers, body: JSON.stringify(testHooks.createTeam2.body)}, {}, console.log);
    // //create "Test Team"
    modules.acceptWebHook({headers: testHooks.createTeam3.headers, body: JSON.stringify(testHooks.createTeam3.body)}, {}, console.log);
    // //add vrann to Marverlous team
    modules.acceptWebHook({headers: testHooks.added.headers, body: JSON.stringify(testHooks.added.body)}, {}, console.log);
    // //add vrann to New Team team
    modules.acceptWebHook({headers: testHooks.added1.headers, body: JSON.stringify(testHooks.added1.body)}, {}, console.log);
    // //add somemember to non-existent "New Team"
    modules.acceptWebHook({headers: testHooks.added2.headers, body: JSON.stringify(testHooks.added2.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testHooks.added3.headers, body: JSON.stringify(testHooks.added3.body)}, {}, console.log);
}

sendWebhooks()

// client.indices
//     .delete({index: "*"})
//     .then(sendWebhooks())
//     .catch(console.log);