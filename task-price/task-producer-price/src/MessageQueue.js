const amqp = require('amqplib/callback_api');


class MessageBroker {
    constructor(connection, topic) {
        this.connection = connection
        this.topic = topic;
    }
    static async init(params = { brokerUrl, topic }) {
        const { brokerUrl, topic } = params
        return await new Promise((resolve, reject) => {
            amqp.connect(brokerUrl, function (error0, connection) {
                if (error0) {
                    console.log(error0)
                    reject(error0);
                }

                connection.createConfirmChannel(function (error1, channel) {
                    if (error1) {
                        throw error1;
                    }
                    channel.assertQueue(topic, {
                        durable: true
                    });

                    resolve(new MessageBroker(channel, topic))
                });

            });
        })
    }

    addMessage(message) {
        this.connection.sendToQueue(this.topic, Buffer.from(message), {
            persistent: true
        }, (err, ok) => {
            if (err !== null) {
                console.log(`error sending message to queue`, err);
                console.log('retrying')
                this.addMessage(message)
            }
            else {
                console.log("success sending message to queue");
            }
        });
    }
}

module.exports = { MessageBroker }