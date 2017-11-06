// var _obj = {
//     property: 10,
//     method2: function() {
//       this.method1(); 
//     },
//     method1: function() {
//       console.log('test')
//     }
    
//   };

//   _obj.method2();


// process.stdin.resume(); //so the program will not close instantly

// function exitHandler(options, err) {
//     if (options.cleanup) {
//         // coordinatorFactory.get({
//         //     client: client,
//         //     index: 'github-members',
//         //     type: 'github-member'
//         // }).createOrUpdate(null);
//         console.log('clean');
//     }
//     if (err) {console.log(err.stack); process.exit();}
//     if (options.exit) process.exit();
// }

// //do something when app is closing
// process.on('exit', exitHandler.bind(null,{cleanup:true, exit:true}));

// //catches ctrl+c event
// process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// //catches uncaught exceptions
// process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

// var esGithubWriter = require('github-es');
// var pullRequestMessages = require('./samples/webhooks/pull-requests.js');
// var writer = esGithubWriter('2861474c182c120b47503373e12db014133de701', 'http://127.0.0.1:9200/');

// var GitHubBuilder = require('github-es/gitHubBuilder')
// github = GitHubBuilder('2861474c182c120b47503373e12db014133de701')

//writer.checkCountPrs();
//github.getPullRequestsCount({});
// github.orgs.get({org:"magento-partners"}).then(function(res){console.log(res.data)}).catch(function(e){console.log(e)});

// github.orgs.getTeams({
//     org: "magento-partners"
// }).then(
//     function(res){
//         res.data.map(function(team) {
//             console.log(team);
//         })
//     }
// ); 


// var options = {
//     uri: 'https://api.github.com/search/issues?q=is:closed+type:pr+repo:magento-partners/magento2ee&sort=created&%E2%80%8C%E2%80%8Border=as',
//     qs: {
//         access_token: '2861474c182c120b47503373e12db014133de701' // -> uri + '?access_token=xxxxx%20xxxxx'
//     },
//     headers: {
//         'User-Agent': 'Request-Promise'
//     },
//     json: true // Automatically parses the JSON string in the response
// };

//writer.checkIntegrity();

// var repoRequest = {
//     owner: 'magento',
//     repo: 'magento2', 
//     state: 'closed',
// }
// writer.synchronizePullRequests(repoRequest);

// var repoRequest = {
//     owner: 'magento',
//     repo: 'magento2', 
//     state: 'open',
// }
// writer.synchronizePullRequests(repoRequest);

// var repoRequest = {
//     owner: 'magento-partners',
//     repo: 'magento2ce', 
//     state: 'closed',
// }
// writer.synchronizePullRequests(repoRequest);

// var repoRequest = {
//     owner: 'magento-partners',
//     repo: 'magento2ce', 
//     state: 'open',
// }
// writer.synchronizePullRequests(repoRequest);

// var repoRequest = {
//     owner: 'magento-partners',
//     repo: 'magento2ee', 
//     state: 'closed',
// }
// writer.synchronizePullRequests(repoRequest);

// var repoRequest = {
//     owner: 'magento-partners',
//     repo: 'magento2ee', 
//     state: 'open',
// }
// writer.synchronizePullRequests(repoRequest);

// writer.synchronizeTeams("magento-partners");

// var coordinatorFactory = require('github-es/entities/coordinator.js')
// var teamWriter = require('github-es/entities/team.js');

// coordinatorFactory.get({
//     client: client,
//     index: 'github-members',
//     type: 'github-member'
// }).createOrUpdate(teamWriter, {id: 666}, {}, {idField: 'id'});
// coordinatorFactory.get({
//     client: client,
//     index: 'github-members',
//     type: 'github-member'
// }).createOrUpdate(teamWriter, {id: 667}, {}, {idField: 'id'});
// coordinatorFactory.get({
//     client: client,
//     index: 'github-members',
//     type: 'github-member'
// }).createOrUpdate(teamWriter, {id: 668}, {}, {idField: 'id'});
// coordinatorFactory.get({
//     client: client,
//     index: 'github-members',
//     type: 'github-member'
// }).createOrUpdate(teamWriter, {id: 669}, {}, {idField: 'id'});


   //.writePullRequest(testMessages.created);
// event = pullRequestMessages.created;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = pullRequestMessages.created;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = pullRequestMessages.created2;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = pullRequestMessages.created3;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = pullRequestMessages.labeled;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = pullRequestMessages.labeled;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// body.label.id = 666;
// writer.processWebHook(eventName, body);

// event = pullRequestMessages.labeled2;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// var teamMessages = require('./samples/webhooks/teams.js');
// event = teamMessages.createTeam;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = teamMessages.createTeam2;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = teamMessages.createTeam3;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = teamMessages.added;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = teamMessages.added2;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);

// event = teamMessages.added3;
// var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
// var body = event.body;
// writer.processWebHook(eventName, body);


// process = {
//     env: {
//         ES_ENDPOINT: 'http://127.0.0.1:9200/',
//         GIT_HUB_KEY: '2861474c182c120b47503373e12db014133de701'    
//     }
// }
// awsLambda = require('../index.js');
// awsLambda.acceptWebHook(event, {}, console.log);
var gitHubToken = process.env.GIT_HUB_KEY;
var GitHubBuilder = require('github-es/gitHubBuilder')
github = GitHubBuilder(gitHubToken)
github.issues.getIssueLabels(
    {owner: 'magento',
repo: 'magento2',
number: 10977}).then(labels => {
    console.log(labels);
})

