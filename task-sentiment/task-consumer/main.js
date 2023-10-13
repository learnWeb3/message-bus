const { OpenSearchStorage } = require('./src/OpenSearchStorage');
const { MqttClient } = require('./src/MqttClient');
const { nanoid } = require('nanoid');
const { DataQualifier } = require('./src/DataQualifier');
const { MessageBroker } = require('./src/MessageQueue');

const {
    OPENSEARCH_URL,
    OPENSEARCH_BASIC_AUTH,
    OPENSEARCH_TOPIC,
    MQTT_AUTH_USERNAME,
    MQTT_AUTH_PASSWORD,
    MQTT_HOST_URL,
    MQTT_PUBLISH_ROOT_TOPIC,
    SENTIMENT_EXTRACTOR_WEBSERVICE_URL,
    SUMMARIZER_WEBSERVICE_URL,
    KEYWORDS_EXTRACTOR_WEBSERVICE_URL,
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

const DATA_QUALIFIER = new DataQualifier({
    sentimentExtractorUrl: SENTIMENT_EXTRACTOR_WEBSERVICE_URL,
    summarizerUrl: SUMMARIZER_WEBSERVICE_URL,
    keywordsExtractorUrl: KEYWORDS_EXTRACTOR_WEBSERVICE_URL
})



async function processNews(data) {
    try {
        const qualifiedData = await DATA_QUALIFIER.qualify([data])
        console.log(`qualified ${qualifiedData.length} articles`)
        const writtenData = await OPENSEARCH_CLIENT.writeData(qualifiedData)
        console.log(`written ${writtenData.length} articles`)
        console.log(writtenData)
        // send push notification through MQTT
        if (writtenData.length) {
            const dataTopic = `${MQTT_PUBLISH_ROOT_TOPIC}/sentiment/${data.tag}/notify/data`
            const refreshTopic = `${MQTT_PUBLISH_ROOT_TOPIC}/sentiment/${data.tag}/notify/refresh`
            MQTT_CLIENT.emit(dataTopic, writtenData)
            MQTT_CLIENT.emit(refreshTopic, { action: 'REFRESH' })
        }
    } catch (error) {
        console.log("error processing data")
        console.log(error)
    }
}


MessageBroker.init({ brokerUrl: MESSAGE_QUEUE_HOST_URL, topic: MESSAGE_QUEUE_TOPIC }).then((messageBroker) => {
    console.log(`message queue broker connection opened.`)
    messageBroker.consume(processNews)
})
