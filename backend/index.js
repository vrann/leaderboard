var esGithubWriter = require("github-es");
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
    var eventName = event.headers['X-GitHub-Event'] ? event.headers['X-GitHub-Event'] : event.headers['x-github-event'];
    if (eventName == 'status') {
        var res = {
            "isBase64Encoded": false,
            "statusCode": 200,
            "headers": {},
            "body": "Response"
        };
        callback(null, res);
        return;
    }

    console.log("Start");
    var body = JSON.parse(event.body);

    console.log(eventName);
    console.log(body.action);
    console.log(event.headers);

    var elasticsearchEndpoint = process.env.ES_ENDPOINT;  
    var gitHubToken = process.env.GIT_HUB_KEY;

    //console.log(elasticsearchEndpoint, gitHubToken)
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)

    //console.log('object id: ', Object.id(writer));
    //console.log(esGithubWriter);

    writer.processWebHook(eventName, body);

    console.log("Complete");
    var res = {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": "Response"
    };
    //console.log(res);
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
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento',
        repo: 'magento2', 
        state: 'open',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-engcom',
        repo: 'msi', 
        state: 'closed',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-engcom',
        repo: 'msi', 
        state: 'open',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ce', 
        state: 'closed',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ce', 
        state: 'open',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ee', 
        state: 'closed',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);

    var repoRequest = {
        owner: 'magento-partners',
        repo: 'magento2ee', 
        state: 'open',
        sort: 'updated',
        direction: 'desc'
    }
    writer.synchronizePullRequests(repoRequest);
}

exports.processIntegrityChecksQueue = function() 
{
    var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
    var gitHubToken = process.env.GIT_HUB_KEY; //""
    var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"  
    var queueUrl = process.env.QUEUE_URL; //"http://sqs.us-east-1.amazonaws.com/417782006694/batch-ecs-queue"
    AWS.config.setPromisesDependency(require('bluebird'));
    var sqs = new AWS.SQS({region: awsRegion});
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    sqs.receiveMessage({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 10
    }).promise().then((messages) => {
        prs = [];
        teams = [];
        var visitedMessages = {}
        receipts = []
        if (messages.hasOwnProperty('Messages') && messages.Messages.length > 0) {
            messages.Messages.map(message => {
                if (visitedMessages.hasOwnProperty(message.MessageId)) {
                    console.log('already visited', message.MessageId);
                    return;
                }
                console.log('visit', message.MessageId);
                visitedMessages[message.MessageId] = true;
                receipts.push(message.ReceiptHandle);
                messageBody = JSON.parse(message.Body);
                console.log(messageBody)
                switch (messageBody.action) {
                    case 'syncTeam':
                        teams.push(messageBody.id)
                        break;
                    case 'syncPr':
                        prs.push(messageBody.pr)
                        break;   
                    default:
                        break;
                }
            })
            console.log(prs, teams)
            promises = [];
            if (prs.length > 0) {
                promises.push(writer.synchronizeIndividualPRs(prs));
            }
            if (teams.length > 0) {
                promises.push(writer.synchronizeIndividualTeam(teams));
            }
            console.log(promises);
            return Promise.all(promises).then(response => {
                console.log(response);
                deleteMessages = [];
                receipts.map(receipt => {
                    deleteMessages.push(sqs.deleteMessage({QueueUrl: queueUrl, ReceiptHandle: receipt}).promise())
                })
                return Promise.all(deleteMessages);
                
            }).then(console.log).catch(console.log)
        }
    })
}

exports.publishStatistic = function() {
    var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
    var gitHubToken = process.env.GIT_HUB_KEY; //""
    //var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    writer.loadPartnersStatistic().then(result => {
        console.log(result)
        var stat = JSON.stringify(result);
        var s3 = new AWS.S3();
        var params = {
            Bucket : 'public.magento.com',
            Key : 'partners.leaderboard-monthly.js',
            Body : stat,
            ACL:'public-read-write',
            ContentType: 'application/json',
            CacheControl: 'max-age=0'
        }
        s3.putObject(params).promise().then(console.log).catch(console.log)
    })
}

exports.publishTestStatistic = function() {
    var elasticsearchEndpoint = process.env.ES_ENDPOINT; //"127.0.0.1:9200" 
    var gitHubToken = process.env.GIT_HUB_KEY; //""
    //var elasticsearchEndpoint = "127.0.0.1:9200" 
    //var gitHubToken = process.env.GIT_HUB_KEY; //""
    //var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    writer.loadPartnersStatistic().then(result => {
        console.log(result)
        var stat = JSON.stringify(result);
        var s3 = new AWS.S3();
        var params = {
            Bucket : 'public.magento.com',
            Key : 'partners.leaderboard-monthly.js',
            Body : stat,
            ACL:'public-read-write',
            ContentType: 'application/json',
            CacheControl: 'max-age=0'
        }
        s3.putObject(params).promise().then(console.log).catch(console.log)
    })
}

exports.loadPullRequestsData = function(event, context, callback) {
    var elasticsearchEndpoint = process.env.ES_ENDPOINT 
    var gitHubToken = process.env.GIT_HUB_KEY; //""
    //var awsRegion = process.env.QUEUE_AWS_REGION; //"us-east-1"
    var writer = esGithubWriter(gitHubToken, elasticsearchEndpoint)
    writer.loadPartnersStatistic().then(result => {
        var res = {
            "isBase64Encoded": false,
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": JSON.stringify(result)
        };
        console.log(res);
        callback(null, res);
    }).catch(console.log)
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
                MaxNumberOfMessages: 50,
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

