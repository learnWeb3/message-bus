const { OpenSearchStorage } = require('./src/OpenSearchStorage');
const { MqttClient } = require('./src/MqttClient');
const { nanoid } = require('nanoid');
const { Kafka } = require("kafkajs");

const {
    OPENSEARCH_URL,
    OPENSEARCH_BASIC_AUTH,
    OPENSEARCH_TOPIC,
    MQTT_AUTH_USERNAME,
    MQTT_AUTH_PASSWORD,
    MQTT_HOST_URL,
    MQTT_PUBLISH_ROOT_TOPIC,
    KAFKA_GROUP_ID,
    KAFKA_BROKERS,
    KAFKA_SASL_USERNAME,
    KAFKA_SASL_PASSWORD,
    KAFKA_CLIENT_ID,
    KAFKA_TOPIC
} = process.env;


const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: KAFKA_BROKERS.split(","),
    sasl: {
        mechanism: "scram-sha-512",
        username: KAFKA_SASL_USERNAME,
        password: KAFKA_SASL_PASSWORD,
    },
});

const OPENSEARCH_CLIENT = new OpenSearchStorage({
    topic: OPENSEARCH_TOPIC,
    rootUrl: OPENSEARCH_URL,
    basicAuth: OPENSEARCH_BASIC_AUTH
})

const MQTT_CLIENT = new MqttClient(
    {
        clientId: nanoid(),
        hostUrl: MQTT_HOST_URL,
        auth: {
            username: MQTT_AUTH_USERNAME,
            password: MQTT_AUTH_PASSWORD
        }
    }
)

const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID })

consumer.connect().then(async () => {
    console.log(`kafka consumer connected`)
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false })

    await consumer.run({
        eachMessage: async ({ message, pause }) => {
            const resume = pause()
            try {
                const scrappedItem = JSON.parse(message.value.toString());
                console.log(JSON.stringify(scrappedItem, null, 4), typeof scrappedItem)
                const writtenData = await OPENSEARCH_CLIENT.writeData([scrappedItem])
                console.log(`written ${writtenData.length} items`)
                console.log(writtenData)
                // send push notification through MQTT
                if (writtenData.length) {
                    const dataTopic = `${MQTT_PUBLISH_ROOT_TOPIC}/price-feed/${scrappedItem.name}/notify/data`
                    const refreshTopic = `${MQTT_PUBLISH_ROOT_TOPIC}/price-feed/${scrappedItem.name}/notify/refresh`
                    MQTT_CLIENT.emit(dataTopic, scrappedItem)
                    MQTT_CLIENT.emit(refreshTopic, { action: 'REFRESH' })
                }
            } catch (error) {
                console.log("error processing data")
                console.log(error)
            }

            resume()
        },
    })
})