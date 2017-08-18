var esGithubWriter = require("gitHubEs");
var AWS = require('aws-sdk');

(function() {
    if ( typeof Object.id == "undefined" ) {
        var id = 0;

        Object.id = function(o) {
            if ( typeof o.__uniqueid == "undefined" ) {
                Object.defineProperty(o, "__uniqueid", {
                    value: ++id,
                    enumerable: false,
                    // This could go either way, depending on your 
                    // interpretation of what an "id" is
                    writable: false
                });
            }

            return o.__uniqueid;
        };
    }
})();

exports.syncTeams = function(event, context, callback) {
    console.log("Start");
    var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
    var gitHubToken = process.env.GIT_HUB_KEY;
    esGithubWriter(gitHubToken, elasticsearchEndpoint)
        .synchronizeTeams();
    console.log("Complete");
}

exports.syncPRs = function syncPRs(event, context, callback) {
    console.log("Start");
    var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
    var gitHubToken = process.env.GIT_HUB_KEY;
    var repositoryOwner = process.env.REPOSITORY_OWNER;
    var repositoryName = process.env.REPOSITORY_NAME;
    var pullRequestState = process.env.PULL_REQUEST_STATE;
    var repoRequest = {
        owner: repositoryOwner,
        repo: repositoryName, 
        state: pullRequestState,
    }
    esGithubWriter(gitHubToken, elasticsearchEndpoint)
        .synchronizePullRequests(repoRequest);
    console.log("Complete");
}

exports.acceptWebHook = function(event, context, callback) {
    console.log("Start");
    var eventName = event.headers['X-Github-Event'] ? event.headers['X-Github-Event'] : event.headers['x-github-event'];
    var body = JSON.parse(event.body);

    console.log(body.action);
    console.log(event.headers);

    var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
    var gitHubToken = process.env.GIT_HUB_KEY;

    console.log(elasticsearchEndpoint, gitHubToken)
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)

    console.log('object id: ', Object.id(writer));
    console.log(esGithubWriter);

    writer.processWebHook(eventName, body);

    console.log("Complete");
    var res = {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": "Response"
    };
    console.log(res);
    callback(null, res);
}

exports.checkIntegrity = function(event, context, callback) {
    var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"  
    var queueUrl = process.env.QUEUE_URL; //"http://sqs.us-east-1.amazonaws.com/417782006694/batch-ecs-queue"
    var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
    var gitHubToken = process.env.GIT_HUB_KEY;
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    writer.checkIntegrity(awsRegion, queueUrl);
}

exports.synchronizeTeams = function(event, context, callback) {
    var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
    var gitHubToken = process.env.GIT_HUB_KEY;
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    writer.synchronizeTeams('magento-partners');
}

exports.synchronizePrs = function(event, context, callback) {
    var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
    var gitHubToken = process.env.GIT_HUB_KEY; //""
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    var repoRequest = {
        owner: 'magento',
        repo: 'magento2', 
        state: 'closed',
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento',
        repo: 'magento2', 
        state: 'open',
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ce', 
        state: 'closed',
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ce', 
        state: 'open',
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ee', 
        state: 'closed',
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ee', 
        state: 'open',
    }
    writer.synchronizePullRequests(repoRequest);
}

exports.scheduleBatchJobs = function(event, context, callback) {
    var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
    var gitHubToken = process.env.GIT_HUB_KEY; //""
    var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"  
    var queueUrl = process.env.QUEUE_URL; //"http://sqs.us-east-1.amazonaws.com/417782006694/batch-ecs-queue"
    var ecsCluster = process.env.ECS_CLUSTER; //"GithubBatchCluster"
    var ecsTaskDefinition = process.env.ECS_TASK_DEFINITION; //"GithubBatchTask"
    var ecsContainerName = process.env.ECS_CONTAINER_NAME; //GithubBatchContainer

    AWS.config.setPromisesDependency(require('bluebird'));
    var ecs = new AWS.ECS({region: awsRegion});
    var sqs = new AWS.SQS({region: awsRegion});


    ecs.describeClusters({
        clusters: [
            ecsCluster
        ]
    }).promise().then(function(response) {
        console.log(response);
        if (response.clusters[0].registeredContainerInstancesCount > 0) {
            sqs.receiveMessage({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: 10,
                VisibilityTimeout: 0
            }).promise().then(function(messages) {
                console.log(messages)
                var visitedMessages = {}
                if (messages.hasOwnProperty('Messages')) {
                    messages.Messages.map(function(message) {
                        if (visitedMessages.hasOwnProperty(message.MessageId)) {
                            console.log('already visited', message.MessageId);
                            return;
                        }
                        console.log('visit', message.MessageId);
                        visitedMessages[message.MessageId] = true;
                        messageBody = JSON.parse(message.Body);
                        switch (messageBody.action) {
                            case "syncPRs":
                                var params = {
                                    cluster: ecsCluster, 
                                    taskDefinition: ecsTaskDefinition,
                                    overrides: {
                                        containerOverrides: [{
                                            name: ecsContainerName, 
                                            command: ["node", "syncPRsAction.js"],
                                            environment: [
                                                {
                                                    name: 'ES_ENDPOINT',
                                                    value: elasticsearchEndpoint
                                                },
                                                {
                                                    name: 'GIT_HUB_KEY',
                                                    value: gitHubToken
                                                }
                                            ],
                                        }]
                                    }
                                };
                                console.log(params);
                                ecs.runTask(params).promise().then(function(response) {
                                    console.log(response)
                                    sqs.deleteMessage({QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle}).promise().then(function(response) {
                                        console.log(response)
                                    }).catch(console.log)
                                }).catch(console.log)
                                break;
                            case "syncTeams":
                                var params = {
                                    cluster: ecsCluster, 
                                    taskDefinition: ecsTaskDefinition,
                                    overrides: {
                                        containerOverrides: [{
                                            name: ecsContainerName, 
                                            command: ["node", "syncTeamsAction.js"],
                                            environment: [
                                                {
                                                    name: 'ES_ENDPOINT',
                                                    value: elasticsearchEndpoint
                                                },
                                                {
                                                    name: 'GIT_HUB_KEY',
                                                    value: gitHubToken
                                                }
                                            ],
                                        }]
                                    }
                                };
                                console.log(params);
                                ecs.runTask(params).promise().then(function(response) {
                                    console.log(response)
                                    sqs.deleteMessage({QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle}).promise().then(function(response) {
                                        console.log(response)
                                    }).catch(console.log)
                                }).catch(console.log)
                                break;    
                            default:
                                console.log(messageBody.action)
                        }
                        console.log(JSON.parse(message.Body));
                        
                    })
                }
            })
            .catch(console.log);
        }
    })
}

