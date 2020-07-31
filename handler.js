'use strict';
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({apiVersion: '2010-08-01'});
const axios = require('axios');
const axiosRetry = require('axios-retry');

const STATE2ACTION = {
  'ALARM': 'AlarmActions',
  'OK': 'OKActions',
  'INSUFFICIENT_DATA': 'InsufficientDataActions',
};

axiosRetry(axios, {retries: 5});

async function sendMessage(message) {
  await axios.post(process.env.WEBHOOK_URL, message);
};

function generateMessage(event) {
  return {
    'type': 'message',
    'attachments': [
      {
        'contentType': 'application/vnd.microsoft.card.adaptive',
        'contentUrl': null,
        'content': {
          '$schema': 'http://adaptivecards.io/schemas/adaptive-card.json',
          'type': 'AdaptiveCard',
          'version': '1.0',
          'text': 'test',
          'body': [
            {
              'type': 'Container',
              'id': 'b45f7e00-2ca4-4fc0-4096-d0de09701619',
              'padding': 'None',
              'items': [
                {
                  'type': 'TextBlock',
                  'id': '85d96053-78c6-73e2-82d0-c5c6dc9819d9',
                  'text': 'CloudWatch Alarm',
                  'wrap': true,
                  'size': 'Large',
                  'color': 'Accent',
                },
              ],
            },
            {
              'type': 'Container',
              'id': 'fc84a4e0-7745-127e-ece2-47ee0d0ad098',
              'padding': 'None',
              'items': [
                {
                  'type': 'ColumnSet',
                  'id': '6fc5ab8b-7065-d2f8-6c22-87aedd672b0b',
                  'columns': [
                    {
                      'type': 'Column',
                      'id': '4392347b-7571-0251-d090-30a240765042',
                      'padding': 'None',
                      'width': 'auto',
                      'items': [
                        {
                          'type': 'Image',
                          'id': '01b0d507-65dd-739b-4ce0-bc53006aea75',
                          'url': 'https://media.giphy.com/media/l2Je5IMLrZSbFD63S/giphy.gif',
                          'size': 'Large',
                        },
                      ],
                    },
                    {
                      'type': 'Column',
                      'padding': 'None',
                      'width': 'stretch',
                      'items': [
                        {
                          'type': 'TextBlock',
                          'id': '9553f7d0-5f4f-3c1c-c551-29900463a164',
                          'text': event.detail.state.reason,
                          'wrap': true,
                        },
                      ],
                    },
                  ],
                  'padding': 'None',
                },
              ],
            },
            {
              'type': 'Container',
              'id': '67498f5d-6401-66fb-c432-262474da9418',
              'padding': 'None',
              'items': [
                {
                  'type': 'ColumnSet',
                  'id': '396dfde9-ae77-26c9-0627-280605f705f1',
                  'columns': [
                    {
                      'type': 'Column',
                      'items': [
                        {
                          'type': 'FactSet',
                          'id': '26002a2b-5fa2-3ad2-83e1-a86c36410497',
                          'facts': [
                            {
                              'title': 'Time',
                              'value': event.time,
                            },
                            {
                              'title': 'Alarm Name',
                              'value': event.detail.alarmName,
                            },
                          ],
                        },
                      ],
                      'padding': 'None',
                      'width': 50,
                    },
                    {
                      'type': 'Column',
                      'padding': 'None',
                      'width': 50,
                      'items': [
                        {
                          'type': 'FactSet',
                          'id': '90eeb1ed-cb00-8cc5-57db-ec3689f3b7ba',
                          'facts': [
                            {
                              'title': 'Region',
                              'value': event.regiom,
                            },
                            {
                              'title': 'Account',
                              'value': event.account,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                  'padding': 'None',
                },
              ],
            },
          ],
          'padding': 'None',
        },
      },
    ],
  };
};

exports.processEvent = async function(event) {
  console.log(event);
  const data = await cloudwatch.describeAlarms({
    AlarmNames: [event.detail.alarmName],
    MaxRecords: 1,
  }).promise();
  const alarms = [...data.CompositeAlarms, ...data.MetricAlarms];
  if (alarms.length === 0) {
    return;
  } else {
    const alarm = alarms[0];
    const action = STATE2ACTION[event.detail.state.value];
    const actions = alarm[action];
    if (alarm.ActionsEnabled) {
      if (actions.filter((action) => action.includes(':autoscaling:')).length > 0) {
        console.log('Dropped auto-scaling alarm.');
      } else {
        await sendMessage(generateMessage(event));
      }
    }
  }
};
