/**
 * Deploy ElasticSearch to store data from GitHub
 * Endpoint url is used to configure Lambda environment variables
 */

resource "aws_elasticsearch_domain" "es" {
  domain_name           = "magento-partners"
  elasticsearch_version = "5.3"
  cluster_config {
    instance_type = "m4.large.elasticsearch"
  }

  ebs_options {
    ebs_enabled = true
    volume_size = 10
    volume_type = "standard"
  }

  advanced_options {
    "rest.action.multi.allow_explicit_index" = "true"
  }

  access_policies = <<CONFIG
{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": [
            "*"
          ]
        },
        "Action": [
          "es:*"
        ]
      }
    ]
}
CONFIG

  snapshot_options {
    automated_snapshot_start_hour = 23
  }

  tags {
    Domain = "MagenoPartners"
  }
}