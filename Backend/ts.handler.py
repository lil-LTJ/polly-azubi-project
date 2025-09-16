import json
import boto3
import uuid
import os
import logging
from botocore.exceptions import ClientError

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
# This will use the IAM Role assigned to the Lambda function
polly = boto3.client('polly')
s3 = boto3.client('s3')

# Define the S3 bucket name from environment variables
# You must configure this variable in the Lambda function's settings
# Example: S3_BUCKET_NAME = your-polly-audio-bucket
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME')
REGION = os.environ.get('AWS_REGION') # Automatically populated by AWS Lambda

def lambda_handler(event, context):
    """
    Handles the API Gateway request to convert text to speech using Amazon Polly.
    """
    try:
        # Log the event for debugging purposes
        logger.info(f"Received event: {json.dumps(event)}")

        # Parse the JSON body from the API Gateway event
        if 'body' not in event:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing request body'})
            }

        body = json.loads(event['body'])
        text = body.get('text')
        voice_id = body.get('voiceId')
        
        if not text or not voice_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing text or voiceId in the request body'})
            }

        # Use a mapping to get the correct Polly VoiceId from the front-end key
        voice_map = {
            'american-male': 'Joey',
            'american-female-1': 'Joanna',
            'american-female-2': 'Kendra',
            'american-southern': 'Matthew',  # A close match for a Southern accent
            'american-teen': 'Kevin',  # A male teenage voice
            'american-news': 'Brian', # A standard voice for narration
            'american-narration': 'Justin', # Another suitable standard voice
            'british-male-1': 'Brian',
            'british-male-2': 'Arthur',
            'british-female-1': 'Amy',
            'british-female-2': 'Olivia',
            'cockney': 'Brian', # No specific Cockney voice, but a standard British male can work
            'british-posh': 'Amy', # A refined British female voice
            'british-news': 'Amy', # A professional British female voice
            'scottish': 'Amy', # No specific Scottish voice, but a standard one is a good fallback
            'australian-male': 'Russell',
            'australian-female': 'Nicole',
            'irish-male': 'Liam',
            'irish-female': 'Niamh',
            'indian-male': 'Aditi',
            'indian-female': 'Raveena',
            'canadian': 'Liam', # Canadian is often similar to standard American/British
            'south-african': 'Ayanda',
            'new-zealand': 'Liam', # No specific New Zealand voice, but a standard one is a good fallback
            'robot': 'Zeina', # A suitable voice with a metallic sound
            'deep-voice': 'Geraint', # A deep, male voice
            'elf': 'Kendra', # A lighter, female voice
            'old-wizard': 'Matthew', # A suitable male voice for a character
            'child': 'Kimberly', # A child voice
            'whisper': 'Joanna', # A voice with a good whisper effect
            'storyteller': 'Matthew' # A suitable voice for storytelling
        }

        # Get the Polly VoiceId, defaulting to a standard voice if not found
        polly_voice_id = voice_map.get(voice_id, 'Joanna')

        # Synthesize the speech using Amazon Polly
        response = polly.synthesize_speech(
            Engine='neural', # Use Neural engine for high-quality audio
            OutputFormat='mp3',
            Text=text,
            VoiceId=polly_voice_id
        )

        # Generate a unique file name
        file_name = f'audio/{uuid.uuid4()}.mp3'

        # Get the audio stream from the response
        stream = response['AudioStream']

        # Upload the audio stream to S3
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=file_name,
            Body=stream.read(),
            ContentType='audio/mpeg',
            ACL='public-read' # Make the file publicly readable for playback
        )

        # Construct the public URL for the audio file
        audio_url = f'https://{S3_BUCKET_NAME}.s3.{REGION}.amazonaws.com/{file_name}'

        # Return a successful response with the audio URL
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                # This is crucial for CORS (Cross-Origin Resource Sharing)
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'audioUrl': audio_url})
        }

    except ClientError as e:
        logger.error(f"AWS Client Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'AWS service error', 'details': str(e)})
        }
    except Exception as e:
        logger.error(f"Internal Server Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An unexpected error occurred', 'details': str(e)})
        }