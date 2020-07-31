const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, {retries: 5});

async function sendMessage(message) {
  var res = await axios.post(process.env.WEBHOOK_URL, message);
};

async function processRecord(record) {
  const subject = record.Sns.Subject;
  const message = JSON.parse(record.Sns.Message);

  await sendMessage({
    "type": "message",
    "attachments": [
      {
        "contentType": "application/vnd.microsoft.card.adaptive",
        "contentUrl": null,
        "content": {
          "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
          "type": "AdaptiveCard",
          "version": "1.0",
          "text": "test",
          "body": [
            {
              "type": "Container",
              "id": "b45f7e00-2ca4-4fc0-4096-d0de09701619",
              "padding": "None",
              "items": [
                {
                  "type": "TextBlock",
                  "id": "85d96053-78c6-73e2-82d0-c5c6dc9819d9",
                  "text": "CloudWatch Alarm",
                  "wrap": true,
                  "size": "Large",
                  "color": "Accent"
                }
              ]
            },
            {
              "type": "Container",
              "id": "fc84a4e0-7745-127e-ece2-47ee0d0ad098",
              "padding": "None",
              "items": [
                {
                  "type": "ColumnSet",
                  "id": "6fc5ab8b-7065-d2f8-6c22-87aedd672b0b",
                  "columns": [
                    {
                      "type": "Column",
                      "id": "4392347b-7571-0251-d090-30a240765042",
                      "padding": "None",
                      "width": "auto",
                      "items": [
                        {
                          "type": "Image",
                          "id": "01b0d507-65dd-739b-4ce0-bc53006aea75",
                          "url": "https://media.giphy.com/media/l2Je5IMLrZSbFD63S/giphy.gif",
                          "size": "Large"
                        }
                      ]
                    },
                    {
                      "type": "Column",
                      "padding": "None",
                      "width": "stretch",
                      "items": [
                        {
                          "type": "TextBlock",
                          "id": "9553f7d0-5f4f-3c1c-c551-29900463a164",
                          "text": message.NewStateReason,
                          "wrap": true
                        }
                      ]
                    }
                  ],
                  "padding": "None"
                }
              ]
            },
            {
              "type": "Container",
              "id": "67498f5d-6401-66fb-c432-262474da9418",
              "padding": "None",
              "items": [
                {
                  "type": "ColumnSet",
                  "id": "396dfde9-ae77-26c9-0627-280605f705f1",
                  "columns": [
                    {
                      "type": "Column",
                      "items": [
                        {
                          "type": "FactSet",
                          "id": "26002a2b-5fa2-3ad2-83e1-a86c36410497",
                          "facts": [
                            {
                              "title": "Time",
                              "value": message.StateChangeTime
                            },
                            {
                              "title": "Alarm Name",
                              "value": message.AlarmName
                            }
                          ]
                        }
                      ],
                      "padding": "None",
                      "width": 50
                    },
                    {
                      "type": "Column",
                      "padding": "None",
                      "width": 50,
                      "items": [
                        {
                          "type": "FactSet",
                          "id": "90eeb1ed-cb00-8cc5-57db-ec3689f3b7ba",
                          "facts": [
                            {
                              "title": "Region",
                              "value": message.Region
                            },
                            {
                              "title": "Account",
                              "value": message.AWSAccountId
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  "padding": "None"
                }
              ]
            }
          ],
          "padding": "None"
        }
      }
    ]
  });
};

/*
example event:
{
  "Records": [{
     "EventSource": "aws:sns",
     "EventVersion": "1.0",
     "EventSubscriptionArn": "arn:aws:sns:us-east-1:XXX:cw-to-slack-Topic-1B8S548158492:a0e76b10-796e-471d-82d3-0510fc89ad93",
     "Sns": {
        "Type": "Notification",
        "MessageId": "[...]",
        "TopicArn": "arn:aws:sns:us-east-1:XXX:cw-to-slack-Topic-1B8S548158492",
        "Subject": "ALARM: \"cw-to-slack-Alarm-9THDKWBS1876\" in US East (N. Virginia)",
        "Message": "{\"AlarmName\":\"cw-to-slack-Alarm-9THDKWBS1876\",\"AlarmDescription\":null,\"AWSAccountId\":\"XXX\",\"NewStateValue\":\"ALARM\",\"NewStateReason\":\"Threshold Crossed: 1 datapoint [3.22 (29/10/17 13:20:00)] was greater than the threshold (1.0).\",\"StateChangeTime\":\"2017-10-30T13:20:35.831+0000\",\"Region\":\"US East (N. Virginia)\",\"OldStateValue\":\"INSUFFICIENT_DATA\",\"Trigger\":{\"MetricName\":\"EstimatedCharges\",\"Namespace\":\"AWS/Billing\",\"StatisticType\":\"Statistic\",\"Statistic\":\"MAXIMUM\",\"Unit\":null,\"Dimensions\":[{\"name\":\"Currency\",\"value\":\"USD\"}],\"Period\":86400,\"EvaluationPeriods\":1,\"ComparisonOperator\":\"GreaterThanThreshold\",\"Threshold\":1.0,\"TreatMissingData\":\"\",\"EvaluateLowSampleCountPercentile\":\"\"}}",
        "Timestamp": "2017-10-30T13:20:35.855Z",
        "SignatureVersion": "1",
        "Signature": "[...]",
        "SigningCertUrl": "[...]",
        "UnsubscribeUrl": "[...]",
        "MessageAttributes": {}
     }
  }]
}
*/
exports.processEvent = async function(event) {
  for (const record of event.Records) {
    await processRecord(record);
  }
};
