## Setting environment variables

Copy .env.template to a new file called .env

Update `.env` with the settings specific to your server.

The server specified in `.env` must be the same as the server specified in your front-end app.

## Generating a Self-Signed SSL Key and Cert

You can use the script below (for linux/mac) users:
- `mkdir certs`
- `cd certs`
- `../scripts/generate-ssh.sh server`

Or manually create your key and cert in `./certs` with `openssl`:
- `mkdir certs`
- `cd certs`
- `openssl req -nodes -new -x509 -keyout server.key -out server.csr`
- `Country Name (2 letter code) []:NZ`
- _Press enter to skip other cert questions_
- `openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt`

Instructions here: https://devcenter.heroku.com/articles/ssl-certificate-self

## Running the server

To run the dev server use the command `npm run dev`

## Bypass Chrome Security

To connect to your server from your frontend app, you will need to allow your self-signed cert to be used in Chrome.

Navigate to your orchestration server in your browser `https://localhost:5000` and choose to "proceed to unsafe site".

This will add your self-signed cert to Chrome's trusted certs for a limited time (a few weeks).

When the override expires your UI will no longer be able to connect. At that time the above process can be repeated to renew the override.

## Emotion Recognition
To add emotion recognition capability add the emotion recognition server url to .env file. It can be like this:
EMOTION_RECOGNITION_URL="http://sm-emotion-recognition.app.localhost:9339/get_processing_result"


## Environment variables 

add `.env` file includes the following  
```yaml
    # For local setup
    EXPRESS_SERVER=127.0.0.1
    EXPRESS_PORT=9229
    SSL_CERT=certs/server.csr
    SSL_KEY=certs/server.key

    # AWS settings - use `aws configure sso`
    AWS_PROFILE=uoa
    AWS_REGION=ap-southeast-2

    # these are temporary credentials - update before `docker compose build`
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_SESSION_TOKEN=

    # OpenAI or perplexity settings
    OPENAI_BASE_URL=https://api.perplexity.ai
    OPENAI_API_KEY=
    LLM=mixtral-8x7b-instruct

    # LEX settings 
    BOT_ID=RR64YJU0DD
    BOT_ALIAS_ID=LS8PLZLCA7
    LOCALE_ID=en_AU

    # URL to read sensor data from DynamoDB
    SENSOR_DATA_BASE_URL=

    # URL to connect with emotion recognition 
    EMOTION_RECOGNITION_URL=http://sm-emotion-recognition.app.localhost:9339/get_processing_result
