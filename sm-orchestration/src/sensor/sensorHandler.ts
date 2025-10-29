import { MessageResponse } from "../avatarConversation";

const https = require('https');
const luxon = require('luxon');


const _log = (...message) => {
    console.log('|sensorHandler|', ...message);
}

const getDeviceIdForSensor = (sensor) => {
    switch (sensor) {
        case 'apple': return 'appleWatch8_id1';
        case 'samsung': return 'samsung_watch5_id1';
        case 'dexcom': return 'dexcomG7_id1';

        default:
            throw new Error('Unknown sensor: ' + sensor);
    }
}

const calculateAgo = (timestamp) => {
    const start = luxon.DateTime.fromMillis(timestamp);
    const end = luxon.DateTime.now();

    const diff = end.diff(start, ['seconds', 'minutes', 'hours', 'days']).toObject();

    if (diff.days > 0) {
        return diff.days + ' days';
    }
    if (diff.hours > 0) {
        return diff.hours + ' hours';
    }
    if (diff.minutes > 0) {
        return diff.minutes + ' minutes';
    }

    return diff.seconds + ' seconds';
}

export class SensorHandler  {

    /**
     * 
     * @param lexIntent  "intent": {
      "confirmationState": "None",
      "name": "SensorData",
      "slots": {
        "sensorType": {
          "value": {
            "interpretedValue": "CGM",
            "originalValue": "cgm",
            "resolvedValues": [
              "CGM"
            ]
          }
        }
      },
      "state": "ReadyForFulfillment"
    },
     * @returns 
     */
    handle(lexIntent): Promise<MessageResponse> {
        _log('intent:', lexIntent)

        const sensorType = lexIntent.slots.sensorType.value.interpretedValue;
        _log('sensorType: ', sensorType);

        let sensor = '';

        switch (sensorType) {
            case 'HR':
                sensor = lexIntent.slots.watch.value.interpretedValue;
                break;
            case 'CGM':
                sensor = 'dexcom';
                break;
                
            default:
                throw new Error('Unknown sensor type: ' + sensorType);
        }

        const deviceId = getDeviceIdForSensor(sensor);
        const url = `https://htrp2map7c.execute-api.ap-southeast-2.amazonaws.com/Prod/sensor-data?device=${deviceId}&last=30`;


        return new Promise((resolve, reject) => {
            https.get(url, res => {
                let data = [];
                const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
                _log('Status Code:', res.statusCode);
                _log('Date in Response header:', headerDate);

                res.on('data', chunk => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    _log('Response ended: ');
                    const result = JSON.parse(Buffer.concat(data).toString());
                    _log('Result: ', result);

                    if (result && result.length > 0) {
                        const last = result[0];
                        const value = last.Device_Readings.value;
                        const unit = last.Device_Readings.unit;
                        const ago = calculateAgo(last.Timestamp);

                        const response = `Your last data from ${sensor} is ${value} ${unit}. This was about ${ago} ago @showcards(myChartCard)`;

                        const reveresed = result.reverse();

                        let timeFormat = 'HH:mm:ss'
                        if (reveresed.length > 2) {
                            const start = luxon.DateTime.fromMillis(reveresed[0].Timestamp);
                            const end = luxon.DateTime.fromMillis(reveresed[reveresed.length - 1].Timestamp);

                            const diff = end.diff(start, ['seconds', 'minutes', 'hours', 'days']).toObject();

                            if (diff.days > 0) {
                                timeFormat = 'MMM dd';
                            }
                            else if (diff.minutes > 0) {
                                timeFormat = 'HH:mm';
                            }
                        }

                        const payload = {
                            "public-myChartCard": {
                                "component": "chart",
                                "data": {
                                    "chartData": {
                                        "labels": reveresed.map(r => {
                                            // return r.timestamp;
                                            return luxon.DateTime.fromMillis(r.Timestamp).toFormat(timeFormat);
                                        }),
                                        "datasets": [
                                            {
                                                "label": `Data from ${sensor} in ${unit}`,
                                                "data": reveresed.map(r => r.Device_Readings.value),
                                                "fill": false,
                                                "borderColor": "rgba(255,192,192,1)"
                                            }
                                        ]
                                    },
                                    "chartOptions": {
                                        "scales": {
                                            "y": {
                                                "beginAtZero": true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        _log('payload: ', payload);

                        const r: MessageResponse = {
                            response,
                            variables: payload
                        }
                        return resolve(r);
                    }
                    else {
                        const r: MessageResponse = {
                            response: `Sorry no data found`
                        }
                        return resolve(r);
                    }


                });
            }).on('error', err => {
                _log('Error: ', err.message);
                reject(err);
            });
        });
    }
}


