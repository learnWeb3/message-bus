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

                connection.createChannel(function (error1, channel) {
                    if (error1) {
                        throw error1;
                    }
                    channel.assertQueue(topic, {
                        durable: true
                    });

                    channel.prefetch(1);

                    resolve(new MessageBroker(channel, topic))
                });

            });

        })
    }

    consume(process = async (data) => { }) {

        const timeout = 1800000 - 1;
        let timeoutRef = null;

        this.connection.consume(this.topic, async (msg) => {
            try {

                timeoutRef = setTimeout(() => {
                    console.log("channel ACK timeout [30min] reached error processing message from queue acking it anyway")
                    this.connection.ack(msg);
                    timeoutRef && clearTimeout(timeoutRef)
                }, timeout)

                const data = JSON.parse(msg.content.toString())
                console.log(`processing data START`)
                await process(data)
                console.log(`processing data END`)
            } catch (error) {
                timeoutRef && clearTimeout(timeoutRef)
                console.log(error)
                console.log("error processing message from queue acking it anyway")
            } finally {
                timeoutRef && clearTimeout(timeoutRef)
                this.connection.ack(msg);
            }

        }, {
            // manual acknowledgment mode,
            // see ../confirms.html for details
            noAck: false
        });
    }
}

module.exports = { MessageBroker }