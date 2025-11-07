# Serverless Text-to-Speech Converter

A fully serverless application built on AWS that converts text to natural-sounding speech using Amazon Polly. The application is designed to be scalable, cost-effective, and fully automated.

## 🚀 Project Overview

This project demonstrates a real-world application of serverless architecture on AWS. Users can input text, select a voice, and receive a high-quality audio file in return. The entire infrastructure is deployed using Infrastructure as Code (IaC) with Terraform.

### Core Features
- Text-to-speech conversion using Amazon Polly
- Serverless architecture with automatic scaling
- Web-based user interface
- Secure API endpoints
- Cost-effective pay-per-use model

## 🏗️ Architecture
Frontend (S3) → API Gateway → Lambda → Amazon Polly
↑
Audio URL ← S3 Bucket (Audio Storage) ← Lambda


### How It Works
1. **Frontend (S3)**: User loads the static website and enters text
2. **API Gateway**: Receives conversion requests and triggers Lambda
3. **Lambda & Polly**: Processes text and generates speech using Amazon Polly
4. **S3 Storage**: Stores generated audio files and provides access URLs
5. **Frontend Response**: Plays the audio file to the user

## 🛠️ Technology Stack

| Service | Purpose | Benefits |
|---------|---------|----------|
| **AWS S3** | Static website hosting & audio file storage | Durable, scalable, low-cost |
| **AWS Lambda** | Backend logic for text-to-speech conversion | Serverless, auto-scaling, pay-per-use |
| **Amazon Polly** | Text-to-speech synthesis | Lifelike speech, multiple voices |
| **API Gateway** | REST API endpoint | Secure, scalable, managed |
| **Terraform** | Infrastructure as Code | Automated, consistent deployments |

## 📁 Project Structure
project/
├── app/ # Frontend application

│ ├── index.html # Main HTML file

│ ├── style.css # Stylesheets

│ └── script.js # Frontend logic

├── lambda/ # Backend Lambda function

│ └── lambda_function.py # Python code for text processing

└── terraform/ # Infrastructure as Code

├── main.tf # Main Terraform configuration

├── variables.tf # Variable definitions

└── outputs.tf # Output values


## 🚀 Deployment Guide

### Prerequisites
- AWS Account with appropriate permissions
- Terraform installed
- AWS CLI configured

### Step 1: Set Up Infrastructure
cd terraform

terraform init

terraform apply


This command provisions:
- S3 buckets for website and audio storage
- Lambda function for text processing
- API Gateway for REST endpoints
- IAM roles and policies

## Step 2: Deploy Frontend
Update app/script.js with your API Gateway URL

Deploy frontend files:
aws s3 sync ./app s3://<your-frontend-bucket> --acl public-read

## Step 3: Test Application
Access your S3 website endpoint in a browser
Enter text and select a voice
Click "Convert" and verify audio playback

💰 Cost Considerations
The application uses a pay-per-use model:
- Amazon Polly: First 5 million characters per month are free
- AWS Lambda: 1 million requests and 400,000 GB-seconds free monthly
- API Gateway: 1 million API calls free per month
- S3: Minimal cost for storage and data transfer
- Estimated cost for low-medium usage: < $10/month

🔒 Security Measures
- IAM Roles: Least privilege principle for Lambda functions
- API Gateway: Managed HTTPS endpoints with potential WAF integration
- S3 Policies: Controlled public access with private audio storage
- Resource Isolation: Separate buckets for frontend and generated content

🔮 Future Enhancements
- Planned Improvements
- Asynchronous Processing: Use SNS/SQS for longer audio files
- User Management: Integrate Amazon Cognito for authentication
- Audio History: Add DynamoDB for user audio storage
- Global Delivery: Implement CloudFront for reduced latency
- Monitoring: CloudWatch dashboards for performance insights
- Potential Features
- Batch text processing
- Multiple audio format support
- Voice customization options
- Usage analytics and reporting
- Multi-language support

🐛 ##Troubleshooting
Common Issues
- 403 Forbidden Errors: Check S3 bucket policies and CORS configuration
- Lambda Timeouts: Increase timeout duration for longer texts
- Audio Playback Issues: Verify S3 object permissions and CORS settings
- API Gateway Errors: Check Lambda integration and IAM permissions

Debugging Steps
- Check CloudWatch logs for Lambda function
- Verify API Gateway execution logs
- Confirm S3 bucket policies and CORS configuration
- Test Polly service directly using AWS CLI

📞 ##Support
- For issues and questions:
- Check AWS Service Health Dashboard
- Review CloudWatch metrics and logs
- Verify Terraform deployment outputs
- Consult AWS documentation for individual services

📄 License
This project is for educational and demonstration purposes. Please review AWS service terms and pricing before production use.

