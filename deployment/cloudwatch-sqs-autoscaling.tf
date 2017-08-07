//SQS, CloudWatch, AutoScaling
resource "aws_ecs_cluster" "GithubBatchCluster" {
  name = "GithubBatchCluster"
}

resource "aws_ecr_repository" "GithubBatchRepo" {
  name = "github-batch-repo"
}

output "aws_ecr_repository" {
  value = "${aws_ecr_repository.GithubBatchRepo.repository_url}"
}

variable "containerName" {
  type = "string"
  default = "GithubBatchContainer"
}

resource "aws_ecs_task_definition" "GithubBatchTask" {
  family                = "GithubBatchTask"
  container_definitions = <<EOF
[
  {
    "name": "${var.containerName}",
    "image": "${aws_ecr_repository.GithubBatchRepo.repository_url}",
    "cpu": 10,
    "memory": 512,
    "essential": true,
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-group": "${aws_cloudwatch_log_group.container_logs.name}",
            "awslogs-region": "us-east-1",
            "awslogs-stream-prefix": "container-logs"
        }
    }
  }
]
EOF
}

resource "aws_iam_role" "GithubBatchRole" {
  name = "GithubBatchRole"
  assume_role_policy = <<EOF
{
"Version": "2012-10-17",
"Statement": [
  {
    "Effect": "Allow",
    "Principal": {
      "Service": "ec2.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }
]
}
EOF
}

//resource "aws_iam_policy_attachment" "agent-policy" {
//  name       = "agent-policy"
//  roles = ["${aws_iam_role.GithubBatchRole.id}"]
//  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerServiceFullAccess"
//}

resource "aws_iam_role_policy" "GithubBatchRolePolicy" {
  name = "GithubBatchRolePolicy"
  role = "${aws_iam_role.GithubBatchRole.id}"
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:CreateCluster",
        "ecs:DeregisterContainerInstance",
        "ecs:DiscoverPollEndpoint",
        "ecs:Poll",
        "ecs:RegisterContainerInstance",
        "ecs:StartTelemetrySession",
        "ecs:Submit*",
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecs:StartTask",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_instance_profile" "GithubBatchInstanceProfile" {
  name = "GithubBatchInstanceProfile"
  role = "${aws_iam_role.GithubBatchRole.name}"
}

resource "aws_vpc" "GithubBatchVPC" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_internet_gateway" "GithubBatchIG" {
  vpc_id = "${aws_vpc.GithubBatchVPC.id}"
}

resource "aws_subnet" "public" {
  vpc_id = "${aws_vpc.GithubBatchVPC.id}"
  cidr_block = "10.0.0.0/24"
  availability_zone = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_route_table" "GithubBatchRT" {
  vpc_id = "${aws_vpc.GithubBatchVPC.id}"
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "${aws_internet_gateway.GithubBatchIG.id}"
  }
}

resource "aws_route_table_association" "GithubBatchRTAssn" {
  subnet_id = "${aws_subnet.public.id}"
  route_table_id = "${aws_route_table.GithubBatchRT.id}"
}

resource "aws_security_group" "GithubBatchSG" {
  name = "GithubBatchSG"
  description = "Allows all traffic"
  vpc_id = "${aws_vpc.GithubBatchVPC.id}"

  ingress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_key_pair" "github-ecs-cluster-key" {
  key_name   = "github-ecs-cluster-key"
  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDVvnAs+keBYqJBOKtTko/Ynuu+/Wpvr3PtA4scmxHnPOeT7zsQqmyfnWTJd/+J/neL8K0p0TDLxn790Po1nFl6ArcUgpmUuv/e3G7GnIodRvu0evhDyDa7EqU2RM2KKm3soBL1EG0KS5/ZbpGQ6580GkiTQyppTaYRWEAud5Eo+sH4lPIKMEZA4EkSAYvtpuafBM+8QWnkTT3ijIWmzascZl4WrgxCbL3ke4oFTXNP/ZWoi4R1PlsDkqDo1mppQMh0nWL1huuAUaWKYCpZWRDXPj8B9DIouPtbR7IGFaj8uF0Oz2pmc0xdbVl4ktHHZEPf5xuPsVM9TgtZ5Eu4efoj etulika@AUS-LM-000411.local"
}

resource "aws_cloudwatch_log_group" "container_logs" {
  name = "container_logs"
}

resource "aws_launch_configuration" "container_host" {
  depends_on = [
    "aws_ecs_cluster.GithubBatchCluster"]
  name          = "container_host"
  image_id      = "ami-33b48a59"
  instance_type = "t2.medium"
  key_name = "${aws_key_pair.github-ecs-cluster-key.key_name}"
  security_groups = ["${aws_security_group.GithubBatchSG.id}"]
  user_data = "#!/bin/bash\necho ECS_CLUSTER='${aws_ecs_cluster.GithubBatchCluster.name}' > /etc/ecs/ecs.config"
  iam_instance_profile = "${aws_iam_instance_profile.GithubBatchInstanceProfile.name}"
}

resource "aws_autoscaling_group" "container_autoscaling" {
  availability_zones        = ["us-east-1a"]
  name                      = "container_autoscaling"
  max_size                  = 1
  min_size                  = 0
  health_check_grace_period = 300
  desired_capacity          = 0
  force_delete              = true
  launch_configuration      = "${aws_launch_configuration.container_host.name}"
  vpc_zone_identifier = ["${aws_subnet.public.id}"]
}

resource "aws_autoscaling_policy" "container_scaleout_policy" {
  name                   = "container_scaleout_policy"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = "${aws_autoscaling_group.container_autoscaling.name}"
}

resource "aws_autoscaling_policy" "container_scalein_policy" {
  name                   = "container_scalein_policy"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = "${aws_autoscaling_group.container_autoscaling.name}"
}

resource "aws_cloudwatch_metric_alarm" "AddCapacityToProcessQueue" {
  alarm_name          = "AddCapacityToProcessQueue"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"

  dimensions {
    QueueName = "${aws_sqs_queue.batch_ecs_queue.name}"
  }

  alarm_description = "This metric monitors SQS Length"
  alarm_actions     = ["${aws_autoscaling_policy.container_scaleout_policy.arn}"]
}

resource "aws_cloudwatch_metric_alarm" "RemoveCapacityFromProcessQueue" {
  alarm_name          = "RemoveCapacityFromProcessQueue"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "3"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "1"

  dimensions {
    ClusterName = "${aws_ecs_cluster.GithubBatchCluster.name}"
  }

  alarm_description = "This metric monitors number of RUNNING Tasks ECS Cluster Length"
  alarm_actions     = ["${aws_autoscaling_policy.container_scalein_policy.arn}"]
}

//resource "aws_cloudwatch_metric_alarm" "RemoveCapacityFromProcessQueue" {
//  alarm_name          = "RemoveCapacityFromProcessQueue"
//  comparison_operator = "LessThanOrEqualToThreshold"
//  evaluation_periods  = "1"
//  metric_name         = "ApproximateNumberOfMessagesVisible"
//  namespace           = "AWS/SQS"
//  period              = "300"
//  statistic           = "Average"
//  threshold           = "1"
//
//  dimensions {
//    #    AutoScalingGroupName = "${aws_autoscaling_group.container_autoscaling.name}"
//    QueueName = "${aws_sqs_queue.batch_ecs_queue.name}"
//  }
//
//  alarm_description = "This metric monitors SQS Length"
//  alarm_actions     = ["${aws_autoscaling_policy.container_scalein_policy.arn}"]
//}

resource "aws_sqs_queue" "batch_ecs_queue" {
  name                      = "batch-ecs-queue"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}

resource "aws_sqs_queue_policy" "test" {
  queue_url = "${aws_sqs_queue.batch_ecs_queue.id}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "sqspolicy",
  "Statement": [
    {
      "Sid": "First",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "${aws_sqs_queue.batch_ecs_queue.arn}",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "${aws_sqs_queue.batch_ecs_queue.arn}"
        }
      }
    }
  ]
}
POLICY
}


