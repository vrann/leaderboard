# Partenrs Statistic Platform

## Architecture
TBD

## Deployment

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
aws_ecr_repository = 417782006694.dkr.ecr.us-east-1.amazonaws.com/github-batch-repo
webhook_invoke_url = https://xhs658ppag.execute-api.us-east-1.amazonaws.com/production

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
