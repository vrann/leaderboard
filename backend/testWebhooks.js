var modules = require('./index.js')
var testHooks = require('./samples/webhooks/teams.js')
var testPRHooks = require('./samples/webhooks/pull-requests.js')
var EsBuilder = require('gitHubEs/esBuilder')
var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
client = EsBuilder(elasticsearchEndpoint)

function sendWebhooks() {
    // //create "Acme" team
    // modules.acceptWebHook({headers: testHooks.createTeam.headers, body: JSON.stringify(testHooks.createTeam.body)}, {}, console.log);
    // //create "Marvelous" team
    // modules.acceptWebHook({headers: testHooks.createTeam2.headers, body: JSON.stringify(testHooks.createTeam2.body)}, {}, console.log);
    // // //create "Test Team"
    // modules.acceptWebHook({headers: testHooks.createTeam3.headers, body: JSON.stringify(testHooks.createTeam3.body)}, {}, console.log);
    // // //add vrann to Marverlous team
    // modules.acceptWebHook({headers: testHooks.added.headers, body: JSON.stringify(testHooks.added.body)}, {}, console.log);
    // // //add vrann to New Team team
    // modules.acceptWebHook({headers: testHooks.added1.headers, body: JSON.stringify(testHooks.added1.body)}, {}, console.log);
    // // //add somemember to non-existent "New Team"
    // modules.acceptWebHook({headers: testHooks.added2.headers, body: JSON.stringify(testHooks.added2.body)}, {}, console.log);
    // // //add zheka to "Test Team"
    // modules.acceptWebHook({headers: testHooks.added3.headers, body: JSON.stringify(testHooks.added3.body)}, {}, console.log);

    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.created.headers, body: JSON.stringify(testPRHooks.created.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.created2.headers, body: JSON.stringify(testPRHooks.created2.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.created3.headers, body: JSON.stringify(testPRHooks.created3.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.labeled.headers, body: JSON.stringify(testPRHooks.labeled.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.labeled2.headers, body: JSON.stringify(testPRHooks.labeled2.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.labeled3.headers, body: JSON.stringify(testPRHooks.labeled3.body)}, {}, console.log);

    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.updated.headers, body: JSON.stringify(testPRHooks.updated.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.synchronized.headers, body: JSON.stringify(testPRHooks.synchronized.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.closed.headers, body: JSON.stringify(testPRHooks.closed.body)}, {}, console.log);
    // //add zheka to "Test Team"
    modules.acceptWebHook({headers: testPRHooks.reopened.headers, body: JSON.stringify(testPRHooks.reopened.body)}, {}, console.log);

}

sendWebhooks()

// client.indices
//     .delete({index: "*"})
//     .then(sendWebhooks())
//     .catch(console.log);