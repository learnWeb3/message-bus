const mqtt = require('mqtt');

class MqttClient {
    constructor(params = {
        clientId: '',
        hostUrl,
        auth: {
            username: '',
            password: '',
        }
    }) {
        this.hostUrl = params.hostUrl;
        this.clientId = params.clientId;
        this.auth = params.auth
        this.client = this._initClient()
    }

    emit(topic, data, retries = 5) {
        const messageOptions = {
            qos: 2,
            retain: true,
        };
        const message = JSON.stringify(data);
        this.client.publish(
            topic,
            message,
            messageOptions,
            (err) => {
                if (err) {
                    if (retries > 0) {
                        retries -= 1
                        console.log("error sending message to MQTT broker, retrying...",)
                        this.emit(topic, data, retries)
                    } else {
                        console.log("error sending message to MQTT broker, droping message",)
                    }
                }
            }
        );
    }
    _initClient() {
        const client = mqtt.connect(this.hostUrl, {
            username: this.auth.username,
            password: this.auth.password,
            rejectUnauthorized: false,
            clientId: this.clientId,
        });

        client.on("connect", function () {
            console.log("broker connection opened.");
        });

        client.on("message", function (topic, message) {
            // message is Buffer
            message = JSON.parse(message.toString());
            console.log(message);
        });

        client.on("error", function (err) {
            console.error(err);
        });

        return client

    }
}

module.exports = { MqttClient }