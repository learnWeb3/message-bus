import * as mqtt from 'mqtt';

export class MqttClient {
    constructor(params = {
        clientId: '',
        hostUrl,
        auth: {
            username: '',
            password: '',
        },
        topics: [

        ],
        onMessage: (topic, message) => { console.log(topic, message) }
    }) {
        this.topics = params.topics;
        this.hostUrl = params.hostUrl;
        this.clientId = params.clientId;
        this.auth = params.auth
        this.onMessage = params.onMessage
        this.client = this._initClient()
    }

    close() {
        this.client.end()
    }

    _initClient() {
        let client = mqtt.connect(this.hostUrl, {
            username: this.auth.username,
            password: this.auth.password,
            rejectUnauthorized: false,
            clientId: this.clientId,
        });

        client.on("connect", () => {
            console.log("broker connection opened.");
            for (const topic of this.topics)
                client.subscribe(topic, (err) => {
                    if (!err) {
                        console.log(`subscribed to topic ${topic}`)
                    }
                    if (err) {
                        console.error(err)
                    }
                });
        });

        client.on("message", (topic, message) => {
            // message is Buffer
            message = JSON.parse(message.toString());
            console.log(message);
            this.onMessage(topic, message)
        });

        client.on("error", (err) => {
            console.error(err);
            this.client = this._initClient()
        });

        return client

    }
}