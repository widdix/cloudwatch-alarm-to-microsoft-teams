# Send CloudWatch alarms to a Microsoft Teams channel

This is an example of how to send CloudWatch alarms to a Microsoft Teams channel. Check out the blog post on marbot.io to learn more.

> One thing before we go any further. You should check out our chatbot [marbot for Microsoft Teams](https://marbot.io) as a more advanced solution to monitor your AWS account. You will love the following features: deduplication of alarms, quick links pointing to the right places on the AWS Management Console, escalation with direct messages, and many more.

## Configure Microsoft Teams

1. Open the channel in Microsoft Teams that you want to send CloudWatch alarms to.
1. Create a new connector of type `Incoming Webhook` for the channel.
1. Copy the webhook URL.

## Deploy to AWS

1. Clone or [download](https://github.com/widdix/cloudwatch-alarm-to-microsoft-teams/zipball/master/) this respository
1. Select a region: `export AWS_REGION=us-east-1`.
1. Choose a unique suffix (replace `$UniqueSuffix` with e.g. your domain/username): `export SUFFIX=$UniqueSuffix`.
2. Create a S3 bucket for SAM: `aws s3 mb s3://cw-to-teams-${SUFFIX}`
3. Install Node.js dependencies: `npm install`
4. Package the Lambda function code: `aws cloudformation package --s3-bucket cw-to-teams-${SUFFIX}  --template-file template.yml --output-template-file template.sam.yml`
5. Deploy the CloudFormation stack (replace `$WebhookURL` with your URL from Microsoft Teams): `aws cloudformation deploy --parameter-overrides "WebhookURL=$WebhookURL" --template-file template.sam.yml --stack-name cw-to-teams --capabilities CAPABILITY_IAM`
