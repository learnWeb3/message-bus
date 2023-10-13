const mqtt = require('mqtt');
const { InternalServerError } = require('../errors');

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

    emit(topic, data) {
        const messageOptions = {
            qos: 2,
            retain: true,
        };
        const message = JSON.stringify(data);
        this.client.publish(
            topic,
            message,
            messageOptions,
            function (err) {
                if (err) {
                    throw new InternalServerError("error sending message to MQTT broker",)
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