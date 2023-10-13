const { OpenSearchStorage } = require('./src/OpenSearchStorage');
const { MqttClient } = require('./src/MqttClient');
const { nanoid } = require('nanoid');
const { MessageBroker } = require('./src/MessageQueue');

const {
    OPENSEARCH_URL,
    OPENSEARCH_BASIC_AUTH,
    OPENSEARCH_TOPIC,
    MQTT_AUTH_USERNAME,
    MQTT_AUTH_PASSWORD,
    MQTT_HOST_URL,
    MQTT_PUBLISH_ROOT_TOPIC,
    MESSAGE_QUEUE_HOST_URL,
    MESSAGE_QUEUE_TOPIC,
} = process.env;


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

async function processPriceFeed(scrappedItem) {
    try {
        console.log(JSON.stringify(scrappedItem, null, 4))
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
}


MessageBroker.init({ brokerUrl: MESSAGE_QUEUE_HOST_URL, topic: MESSAGE_QUEUE_TOPIC }).then((messageBroker) => {
    console.log(`message queue broker connection opened.`)
    messageBroker.consume(processPriceFeed)
})
