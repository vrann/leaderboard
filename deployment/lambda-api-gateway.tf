/**
 * Deploy Api Gateway Wrapper around lambda to listen to WebHooksfrom the GitHub
 */

resource "aws_iam_role_policy" "cloudwatchECSSQSAccess" {
  name = "cloudwatchECSSQSAccess"
  role = "${aws_iam_role.iam_for_lambda.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:FilterLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Action": [
        "autoscaling:Describe*",
        "cloudwatch:*",
        "logs:*",
        "sns:*",
        "ecs:*",
        "sqs:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_s3_bucket" "magento-partners-artifacts" {
    bucket = "magento-partners-artifacts"
    acl = "private"
    versioning {
        enabled = true
    }
}

resource "aws_s3_bucket_object" "github-elastic" {
  bucket = "${aws_s3_bucket.magento-partners-artifacts.bucket}"
  key    = "github-elastic.zip"
  source = "../artifacts/github-elastic.zip"
  etag   = "${md5(file("../artifacts/github-elastic.zip"))}"
}

resource "aws_lambda_function" "GitHubWebhook" {
  filename         = "../artifacts/github-elastic.zip"
  # Upload from S3 is possible only during creation of the object. During the update terrafor has now way determining that the object in S3 is outdated
  # see https://github.com/hashicorp/terraform/issues/6901
  # s3_bucket         = ${aws_s3_bucket_object.github-elastic.}
  # s3_key            = "${aws_s3_bucket_object.github-elastic.key}"
  # s3_object_version = "${aws_s3_bucket_object.github-elastic.version_id}"
  function_name     = "GitHubWebhook"
  role              = "${aws_iam_role.iam_for_lambda.arn}"
  handler           = "github-elastic.acceptWebHook"
  source_code_hash  = "${base64sha256(file("../artifacts/github-elastic.zip"))}"
  runtime           = "nodejs6.10"

  environment {
    variables = {
      ES_ENDPOINT = "${aws_elasticsearch_domain.es.endpoint}"
      GIT_HUB_KEY = "${var.gitHubKey}"
    }
  }
}

/**
 * Check Data Integrity every hour and write to SQS queue any actions which need to be taken
 */
resource "aws_cloudwatch_event_rule" "checkIntegrityTimer" {
  name        = "checkIntegrityTimer"
  description = "Trigger Check Integrity Every Hour"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "checkIntegrityAction" {
  rule      = "${aws_cloudwatch_event_rule.checkIntegrityTimer.name}"
  target_id = "runCheckDataIntegrityLambda"
  arn       = "${aws_lambda_function.CheckDataIntegrity.arn}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_CheckDataIntegrity" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = "${aws_lambda_function.CheckDataIntegrity.function_name}"
    principal = "events.amazonaws.com"
    source_arn = "${aws_cloudwatch_event_rule.checkIntegrityTimer.arn}"
}

resource "aws_lambda_function" "CheckDataIntegrity" {
  filename         = "../artifacts/github-elastic.zip"
  function_name    = "CheckDataIntegrity"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "github-elastic.checkIntegrity"
  source_code_hash = "${base64sha256(file("../artifacts/github-elastic.zip"))}"
  runtime          = "nodejs6.10"

  environment {
    variables = {
      ES_ENDPOINT = "${aws_elasticsearch_domain.es.endpoint}"
      GIT_HUB_KEY = "${var.gitHubKey}"
      QUEUE_AWS_REGION = "${var.myregion}"
      QUEUE_URL = "https://sqs.${var.myregion}.amazonaws.com/${var.accountId}/${aws_sqs_queue.batch_ecs_queue.name}"
    }
  }
}

/**
 * Check SQS queue every 5 min and schedule ECS tasks
 */
resource "aws_cloudwatch_event_rule" "processSQSTimer" {
  name        = "processSQSTimer"
  description = "Check SQS queue every 5 min and schedule ECS tasks"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "processSQSAction" {
  rule      = "${aws_cloudwatch_event_rule.processSQSTimer.name}"
  target_id = "runProcessSQSQueueLambda"
  arn       = "${aws_lambda_function.ProcessSQSQueue.arn}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_ProcessSQSQueue" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = "${aws_lambda_function.ProcessSQSQueue.function_name}"
    principal = "events.amazonaws.com"
    source_arn = "${aws_cloudwatch_event_rule.processSQSTimer.arn}"
}

resource "aws_lambda_function" "ProcessSQSQueue" {
  filename         = "../artifacts/github-elastic.zip"
  function_name    = "ProcessSQSQueue"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "github-elastic.scheduleBatchJobs"
  source_code_hash = "${base64sha256(file("../artifacts/github-elastic.zip"))}"
  runtime          = "nodejs6.10"

  environment {
    variables = {
      ES_ENDPOINT = "${aws_elasticsearch_domain.es.endpoint}"
      GIT_HUB_KEY = "${var.gitHubKey}"
      QUEUE_AWS_REGION = "${var.myregion}"
      QUEUE_URL = "https://sqs.${var.myregion}.amazonaws.com/${var.accountId}/${aws_sqs_queue.batch_ecs_queue.name}"
      ECS_CLUSTER = "${aws_ecs_cluster.GithubBatchCluster.name}"
      ECS_TASK_DEFINITION = "${aws_ecs_task_definition.GithubBatchTask.family}"
      ECS_CONTAINER_NAME = "${var.containerName}"
    }
  }
}

resource "aws_api_gateway_rest_api" "MagentoPartnersGithubIntegration" {
  name        = "MagentoPartnersGithubIntegration"
  description = "Api for the Magento Partners Integration application"
}

resource "aws_api_gateway_method" "GitHubWebhookPOST" {
  rest_api_id   = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.id}"
  resource_id   = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.root_resource_id}"
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "200" {
  rest_api_id = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.id}"
  resource_id = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.root_resource_id}"
  http_method = "${aws_api_gateway_method.GitHubWebhookPOST.http_method}"
  status_code = "200"
  response_models = {
    "application/json" = "Empty"
  }
}

resource "aws_api_gateway_integration" "GitHubWebhookIntegration" {
  rest_api_id             = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.id}"
  resource_id             = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.root_resource_id}"
  http_method             = "${aws_api_gateway_method.GitHubWebhookPOST.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.myregion}:lambda:path/2015-03-31/functions/${aws_lambda_function.GitHubWebhook.arn}/invocations"
}

resource "aws_api_gateway_deployment" "GitHubWebhookDeploymentProduction" {
  depends_on = [
    "aws_api_gateway_integration.GitHubWebhookIntegration"]

  rest_api_id = "${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.id}"
  stage_name = "production"
}

output "webhook_invoke_url" {
  value = "${aws_api_gateway_deployment.GitHubWebhookDeploymentProduction.invoke_url}"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.GitHubWebhook.arn}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.myregion}:${var.accountId}:${aws_api_gateway_rest_api.MagentoPartnersGithubIntegration.id}/*/${aws_api_gateway_method.GitHubWebhookPOST.http_method}/*"
}