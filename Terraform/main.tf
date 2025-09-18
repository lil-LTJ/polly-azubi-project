# Configure the AWS Provider
provider "aws" {
  region = var.aws_region
}


# 1. Create a dedicated S3 Bucket for the audio files
resource "aws_s3_bucket" "polly_audio_bucket" {
  bucket = var.s3_bucket_name
  tags = {
    Name = "Polly Audio Bucket"
  }
}

# Static website bucket
resource "aws_s3_bucket" "static_website_bucket" {
  bucket = "static-website-12345-${random_id.bucket_suffix.hex}"
  tags = {
    Name = "Static Website Bucket"
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Static website bucket public access
resource "aws_s3_bucket_public_access_block" "static_website_bucket_pab" {
  bucket = aws_s3_bucket.static_website_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static_website_bucket_policy" {
  bucket = aws_s3_bucket.static_website_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.static_website_bucket_pab]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static_website_bucket.arn}/*"
      }
    ]
  })
}

# 1b. Enable public access to the S3 bucket
resource "aws_s3_bucket_public_access_block" "polly_audio_bucket_pab" {
  bucket = aws_s3_bucket.polly_audio_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "polly_audio_bucket_policy" {
  bucket = aws_s3_bucket.polly_audio_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.polly_audio_bucket_pab]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.polly_audio_bucket.arn}/*"
      }
    ]
  })
}


# 2. Create the IAM Role for the Lambda function
resource "aws_iam_role" "tts_lambda_role" {
  name = "tts_lambda_role"


  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}


# 2b. Attach a policy to the IAM role for Polly, S3, and CloudWatch Logs
resource "aws_iam_role_policy" "tts_lambda_policy" {
  name = "tts_lambda_policy"
  role = aws_iam_role.tts_lambda_role.id


  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "polly:SynthesizeSpeech",
        ]
        Effect = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
        ]
        Effect = "Allow"
        Resource = "${aws_s3_bucket.polly_audio_bucket.arn}/*"
      },
      {
        Action = "s3:GetBucketLocation"
        Effect = "Allow"
        Resource = aws_s3_bucket.polly_audio_bucket.arn
      },
      {
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Effect = "Allow"
        Resource = "arn:aws:logs:*:*:*"
      },
    ]
  })
}


# 3. Create the Lambda function
resource "aws_lambda_function" "tts_lambda" {
  filename         = "lambda_function.zip" # This file needs to be created from your python code
  function_name    = "TextToSpeechLambda"
  role             = aws_iam_role.tts_lambda_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.9"
  source_code_hash = filebase64sha256("lambda_function.zip")
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      S3_BUCKET_NAME = aws_s3_bucket.polly_audio_bucket.id
    }
  }
}


# 4. Create the API Gateway to trigger the Lambda function
resource "aws_api_gateway_rest_api" "tts_api" {
  name        = "TextToSpeechAPI"
  description = "API for the Text to Speech service"
}


resource "aws_api_gateway_resource" "tts_resource" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  parent_id   = aws_api_gateway_rest_api.tts_api.root_resource_id
  path_part   = "convert"
}


resource "aws_api_gateway_method" "tts_method" {
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  resource_id   = aws_api_gateway_resource.tts_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "tts_method_response" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  resource_id = aws_api_gateway_resource.tts_resource.id
  http_method = aws_api_gateway_method.tts_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}


resource "aws_api_gateway_integration" "tts_integration" {
  rest_api_id             = aws_api_gateway_rest_api.tts_api.id
  resource_id             = aws_api_gateway_resource.tts_resource.id
  http_method             = aws_api_gateway_method.tts_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.tts_lambda.invoke_arn
}

resource "aws_api_gateway_integration_response" "tts_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  resource_id = aws_api_gateway_resource.tts_resource.id
  http_method = aws_api_gateway_method.tts_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  depends_on = [aws_api_gateway_integration.tts_integration]
}


resource "aws_lambda_permission" "apigateway_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tts_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.tts_api.execution_arn}/*/*"
}


# 4c. Create a CORS preflight OPTIONS method
resource "aws_api_gateway_method" "options_method" {
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  resource_id   = aws_api_gateway_resource.tts_resource.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}


resource "aws_api_gateway_integration" "options_integration" {
  rest_api_id          = aws_api_gateway_rest_api.tts_api.id
  resource_id          = aws_api_gateway_resource.tts_resource.id
  http_method          = aws_api_gateway_method.options_method.http_method
  type                 = "MOCK"
  passthrough_behavior = "WHEN_NO_MATCH"
  request_templates = {
    "application/json" = "{ \"statusCode\": 200 }"
  }
}


resource "aws_api_gateway_method_response" "options_response" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  resource_id = aws_api_gateway_resource.tts_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true,
  }
}


resource "aws_api_gateway_integration_response" "options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id
  resource_id = aws_api_gateway_resource.tts_resource.id
  http_method = aws_api_gateway_method.options_method.http_method
  status_code = aws_api_gateway_method_response.options_response.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'",
  }
  depends_on = [aws_api_gateway_integration.options_integration]
}


# 4d. Deploy the API Gateway
resource "aws_api_gateway_deployment" "tts_deployment" {
  rest_api_id = aws_api_gateway_rest_api.tts_api.id


  # This trigger forces a new deployment whenever a resource changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.tts_resource.id,
      aws_api_gateway_method.tts_method.id,
      aws_api_gateway_integration.tts_integration.id,
      aws_api_gateway_method.options_method.id,
      aws_api_gateway_integration.options_integration.id,
    ]))
  }


  lifecycle {
    create_before_destroy = true
  }
}


# Corrected: Use a separate aws_api_gateway_stage resource
resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.tts_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.tts_api.id
  stage_name    = "prod"
}
