import json
import boto3
import uuid
from botocore.exceptions import ClientError
import os

def lambda_handler(event, context):
    # CORS headers
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    
    try:
        # Parse the request body
        body = json.loads(event['body'])
        text = body.get('text', '')
        voice_id = body.get('voiceId', body.get('voice', 'Joanna'))
        
        # Map custom voice IDs to AWS Polly voices
        voice_mapping = {
            'american-male': 'Matthew',
            'american-female-1': 'Joanna',
            'american-female-2': 'Kimberly',
            'american-southern': 'Justin',
            'american-teen': 'Ivy',
            'american-news': 'Matthew',
            'american-narration': 'Matthew',
            'british-male-1': 'Brian',
            'british-male-2': 'Arthur',
            'british-female-1': 'Emma',
            'british-female-2': 'Amy',
            'cockney': 'Brian',
            'british-posh': 'Brian',
            'british-news': 'Brian',
            'scottish': 'Brian',
            'australian-male': 'Russell',
            'australian-female': 'Nicole',
            'irish-male': 'Brian',
            'irish-female': 'Emma',
            'indian-male': 'Aditi',
            'indian-female': 'Aditi',
            'canadian': 'Joanna',
            'south-african': 'Joanna',
            'new-zealand': 'Nicole',
            'robot': 'Matthew',
            'deep-voice': 'Matthew',
            'elf': 'Ivy',
            'old-wizard': 'Matthew',
            'child': 'Ivy',
            'whisper': 'Joanna',
            'storyteller': 'Matthew'
        }
        
        # Get the actual Polly voice ID
        polly_voice = voice_mapping.get(voice_id, 'Joanna')
        
        if not text:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Text is required'})
            }
        
        # Initialize AWS services
        polly = boto3.client('polly')
        s3 = boto3.client('s3')
        
        # Generate unique filename
        filename = f"audio_{uuid.uuid4()}.mp3"
        
        # Synthesize speech
        response = polly.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=polly_voice
        )
        
        # Upload to S3
        bucket_name = os.environ['S3_BUCKET_NAME']
        s3.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=response['AudioStream'].read(),
            ContentType='audio/mpeg'
        )
        
        # Generate S3 URL
        audio_url = f"https://{bucket_name}.s3.amazonaws.com/{filename}"
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Audio generated successfully',
                'audioUrl': audio_url
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }