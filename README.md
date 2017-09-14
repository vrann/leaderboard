# Partners Statistic Platform

## Architecture

System is designed using Server-less architecture approach, where no dedicated server is used to run the analytics and data storage. System uses services only: Lambda, SQS, Elasticsearch Service, ECS to run the data retrieval and analytics.

Terraform is used to deploy the system to the AWS and connect all services to each other.

Frontend is designed as a static web page with rich javascript application which loads data from the API. It is hosted in the S3 bucket.

### Webhooks

System is subscribed to all GitHub webhooks and provides and API endpoint to accept the webhooks data and store it to the Elasticsearch Service. Endpoints is implemented using AWS API Gateway which sends all data to the AWS Lambda.

![alt text](https://s3.amazonaws.com/magento-partners-content/GitHubWebHooks.jpg)

Lambda functions are implemented in NodeJS. For the GitHubWebhook see backend/index.js, exports.acceptWebHook.

The Webhooks allows real-time update of the data for available teams, team members, pull requests.

### Data Sync

Despite usage of the WebHooks, sometimes data still need to be synhronised. That can happen in two cases: 1) at the very beginning, when old data still was not loaded to the repository and 2) when data was lost in transition for whatever reason. In order to address both cases system uses batch jobs scheduled on the EC2 Container Service.

CheckDataIntegrity Lambda (see backend/index.js, exports.checkIntegrity) is running on the certain intervals of time and checks is there any missing data in ElasticSearch service. It checks: count of PRs on GitHuib, count of teams on GitHub, consistency in data between PRs, teams and memebers on ElasticSerach. If any problem was found it sends message to the SQS

Separate Lambda ProcessSQSQueue (see backend/index.js, exports.scheduleBatchJobs) reads messages from the queue and schedules batch jobs on the EC2 Container Service. Batch jobs are designed as NodeJS applications running in docker containers which syncronises teams and pull requests with the ElasticSearch.

![](https://s3.amazonaws.com/magento-partners-content/SyncTeamsPRs.jpg)

## Deployment

![](https://chocolatey.org/content/packageimages/terraform.0.9.6.png)

Deployment is implemented using Infrastructure as Code (IAC) approach using Terraform 

For the deployment scripts see `/deployment`

### 0. Configure Keys

Copy `deployment/terraform.tfvars.dist` to the `deployment/terraform.tfvars` and update it with correct account id, region and GitHub token

### 1. Build Artifacts
```
cd deployment
./create-lambda-zip.sh
```

### 2. Deploy environment
```
cd deployment
terraform apply
```

Save output of the command:
```
aws_ecr_repository = 417782006694.dkr.ecr.us-east-1.amazonaws.com/github-batch-repo
webhook_invoke_url = https://xhs658ppag.execute-api.us-east-1.amazonaws.com/production
```

### 4. Build and deploy container image
```
cd backend
docker build .
docker tag <IMAGE_ID> <aws_ecr_repository>
$(aws ecr get-login)
docker push <aws_ecr_repository>
```

### 5. Install GitHub webhooks

To set up a repository webhook on GitHub, head over to the Settings page of your repository, and click on Webhooks & services. After that, click on Add webhook.
Payload url: <webhook_invoke_url>
Content type: `application/json`
Events: Send me all

### 6. Compile and deploy Frontend
```
cd frontend
webpack
cd dist
aws s3 sync . s3://partners.magento.com/
```
