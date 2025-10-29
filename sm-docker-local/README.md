# SM Local Dev Setup

## Prerequisites
### SM Avatar
### mkcert
* [mkcert](https://mkcert.dev/)

### docker 

* You should be able to **Manage Docker as a non-root user**. 
* Otherwise please follow [Linux post-installation steps for Docker Engine](https://docs.docker.com/engine/install/linux-postinstall/)

### docker-compose

## Setup

### Clone this repo
- clone this repo in the same directory as `sm-token-server` &  `sm-orchestration`
- directory structure should look like this:
``` 
.sm-all
├── sm-docker-local (this repo)
├── sm-token-server
├── sm-orchestration
|-- sm-avatar-web
└── ....
```
### Soul Machines Setup
* Add your IP to allowlist in SM
```sh
    # get your current ip
    curl ifconfig.me
```
* click edit on your avatar / click the pencil icon.
* go to Orchestration settings and click `Orchestration server configuration`.
* enable local access by clicking switch in `I'm developing locally`
* In `Public IP Address & Subnet Mask` add your ip and mask to there. `your_ip/32`
* deploy the avatar now.

* once you deployed in the project It includes the public and private keys in  `connection config`.
(Alternatively in your DashBoard, you click open project to reach that page)


### Environment Variables
* For `sm-token-server`, add `.env.docker-local` file includes the followings 
  ```yaml
      - SESSION_SERVER=dh.az.soulmachines.cloud
      - JWT_PUBLIC_KEY=
      - JWT_PRIVATE_KEY= 
      - TH_SESSION_SERVER=dh.az.soulmachines.cloud
      - TH_JWT_PUBLIC_KEY=
      - TH_JWT_PRIVATE_KEY= 
  ```
* For `sm-orchestration`, add `.env` file includes the following  
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

  ```
* Also for `sm-orchestration`, check if you want to use `DockerFile.dev` or `DockerFile`
* For `sm-avatar-web`, all variables are in `compose.yaml`
```yaml
    - NODE_ENV=production
    - REACT_APP_TOKEN_URL=https://token-server.app.localhost/auth/authorize
    - REACT_APP_PERSONA_AUTH_MODE=1
    - REACT_APP_ORCHESTRATION_MODE=true
    - REACT_APP_ORCHESTRATION_URL=https://orchestration-server.app.localhost
    - ESLINT_NO_DEV_ERRORS=true
    - GENERATE_SOURCEMAP=false
    - REACT_APP_SESSION_SERVER=dh.az.soulmachines.cloud
    - PORT=3001
```
* Modify the `compose.yaml` for `web-client`
    ```yaml
        - REACT_APP_SESSION_SERVER=dh.az.soulmachines.cloud
    ```
* Add a file called `.env` in `sm-chat-pdf`
    ```yaml
        OPENAI_API_KEY=sk-yourkey-here
    ```
* other environment varaibles are avilable in `compose.yaml` file.

### Setup AWS Creds
* Install AWS CLI Linux
```sh
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

If you are having some problems installing the AWS CLI or need Windows install instructions, refer to the [complete install instructions](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

* Add Your Access Key to AWS CLI

We now need to tell the AWS CLI to use your Access Keys.
It should look something like this:
```
Access key ID AKIAIOSFODNN7EXAMPLE
Secret access key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```
* You can get your keys from aws console from `IAM`-`Users`->`your name`->`Security credentials`->`Access Keys`
* Alternatively you can click the username on top right corner and click `Security credentials`->`Access Keys`
* run `aws configure` to add your keys.
* region `ap-southeast-2`
* output format  `json`



### Up & Running (Automation)

* `cd` into this repo and run `run.sh`
* or run the following commands from root folder of `sm_all`:
```bash
cd sm-docker-local
chmod +x run.sh
./run.sh
```

#### Server URLS
* `https://token-server.app.localhost/` - Token Server
* `https://token-server.app.localhost/ping` - Health Check

* `https://orchestration-server.app.localhost/` - Orchestration Server
* `https://orchestration-server.app.localhost/healthz` - Health Check

* `wss://orchestration-server.app.localhost` - Orchestration Server Websocket

#### Web URL

* `http://sm-web.app.localhost/`




### Manual Setup (Not Required If the Automation script works)
* `cd` into this repo
* run the following commands:
#### Generate mkcert certs

```bash
# create certificates
mkdir -p ./certs
mkdir -p ./data

mkcert -install

```mkcert -cert-file ./certs/local-cert.pem -key-file ./certs/local-key.pem "app.localhost" "*.app.localhost" "domain.local" "*.domain.local" 

#### Create networks that will be used by Traefik:

```bash
docker network create proxy
```

#### Now start docker compose
```
docker-compose up
```