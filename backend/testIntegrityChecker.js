var integrityChecker = require('gitHubEs/integrityChecker.js');
var EsBuilder = require('gitHubEs/esBuilder')
var GitHubBuilder = require('gitHubEs/gitHubBuilder')
var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"  
var queueUrl = process.env.QUEUE_URL; //"http://sqs.us-east-1.amazonaws.com/417782006694/batch-ecs-queue"
var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
var gitHubToken = process.env.GIT_HUB_KEY;
client = EsBuilder(elasticsearchEndpoint)
github = GitHubBuilder(gitHubToken)



integrityChecker(github, client, awsRegion, queueUrl).checkIntegrity();