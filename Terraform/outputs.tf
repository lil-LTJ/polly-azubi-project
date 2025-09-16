output "api_gateway_url" {
  description = "The invoke URL for the API Gateway endpoint."
  value       = aws_api_gateway_stage.prod.invoke_url
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket."
  value       = aws_s3_bucket.polly_audio_bucket.id
}