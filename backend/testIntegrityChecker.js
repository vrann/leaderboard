var integrityChecker = require('github-es/integrityChecker.js');
var EsBuilder = require('github-es/esBuilder')
var GitHubBuilder = require('github-es/gitHubBuilder')
var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"  
var queueUrl = process.env.QUEUE_URL; //"http://sqs.us-east-1.amazonaws.com/417782006694/batch-ecs-queue"
var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
var gitHubToken = process.env.GIT_HUB_KEY;
client = EsBuilder(elasticsearchEndpoint)
github = GitHubBuilder(gitHubToken)



integrityChecker(github, client, awsRegion, queueUrl).checkIntegrity();