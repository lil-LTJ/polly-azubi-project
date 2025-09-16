variable "aws_region" {
  description = "The AWS region to deploy the resources in."
  type        = string
  default     = "us-east-1"
}

variable "s3_bucket_name" {
  description = "A unique name for the S3 bucket to store audio files."
  type        = string
  default     = "stennis-smith-polly-audio-bucket-name" # Change this to a unique name
}