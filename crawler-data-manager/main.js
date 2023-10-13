const express = require('express');
const { OpenSearchStorage } = require('./src/OpenSearchStorage');
const { authorizeBodyParams, requireBodyParams } = require('./middlewares/validate.middlewares');
const { errorHandler } = require('./middlewares/error-handler.middlewares');
const { MqttClient } = require('./src/MqttClient');
const { nanoid } = require('nanoid');
const { DataQualifier } = require('./src/DataQualifier');
const { InternalServerError } = require('./errors');
const app = express();

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
    KEYWORDS_EXTRACTOR_WEBSERVICE_URL
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

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/',
    authorizeBodyParams({
        tag: true,
        data: true
    }),
    requireBodyParams({
        tag: true,
        data: true
    }),
    async (req, res) => {
        try {
            const { tag, data } = req.body
            res.status(200).json({
                message: `received ${data.length} articles to qualify`
            })
            const newData = await Promise.all(data.filter(async (item) => {
                const existingEntries = await OPENSEARCH_CLIENT.search({
                    title: item.title
                });
                return !existingEntries.length
            }))
            console.log(`received ${newData.length} new articles to qualify and register`)
            const qualifiedData = await DATA_QUALIFIER.qualify(newData)
            console.log(`qualified ${qualifiedData.length} articles`)
            const writtenData = await OPENSEARCH_CLIENT.writeData(tag, qualifiedData)
            console.log(`written ${writtenData.length} articles`)
            console.log(writtenData)
            // send push notification through MQTT
            if (writtenData.length) {
                const dataTopic = `${MQTT_PUBLISH_ROOT_TOPIC}/${tag}/notify/data`
                const refreshTopic = `${MQTT_PUBLISH_ROOT_TOPIC}/${tag}/notify/refresh`
                MQTT_CLIENT.emit(dataTopic, writtenData)
                MQTT_CLIENT.emit(refreshTopic, { action: 'REFRESH' })
            }
        } catch (error) {
            console.log(error)
            throw new InternalServerError(`error qualifing and registering data`)
        }
    })


app.use(errorHandler)

app.listen(9000, '0.0.0.0', () => {
    console.log(`server running on port 9000`)
})



// OPENSEARCH_CLIENT.writeData("latest", [
//     {
//         "title": "XRP Holders' Lawyer Teases Incoming 'Big Announcement'",
//         "link": "https://u.today/xrp-holders-lawyer-teases-incoming-big-announcement",
//         "publishedAt": 1695111240000,
//         "content": "In his characteristic manner, XRP holders' lawyer John Deaton has triggered a new round of curiosity in the community after revealing to his more than 293.6K followers on the X app that he will have a \"Big Announcement\" to make later today. As usual, the post has triggered a debate in the minds of his followers as to what the big announcement could be.\n\n\n\n\n\n\n\n\n\n\nIf everything works out, I’ll have a BIG announcement this Friday (and no, I’m not suing anyone - yet)!— John E Deaton (@JohnEDeaton1) September 18, 2023 RelatedPro-XRP Lawyer Enters LBRY CaseThough Deaton attached a condition to the post as he noted that the revelations will only come if \"everything works out,\" those who have been following him argue that, for him to tease the community, the announcement is as good as happening already.John Deaton currently plays a key role in the ongoing lawsuit between the blockchain payments firm Ripple Labs Inc. and the United States Securities and Exchange Commission (SEC). However, while he is most renowned for representing more than 75,000 XRP holders, Deaton now also represents about 3,000 customers of Coinbase and Binance exchanges, both of which are now also involved in active lawsuits against the SEC.The teased big announcement could involve any of the trio platforms, an uncertain feeling that takes the intrigue to a whole new level.Community guessesAs is human nature, members of the Ripple and XRP community have started guessing at what the potential announcement might be about. One of the commenters noted that John Deaton might have finalized plans to bring onto his CryptoLaw show the SEC whistleblower, Steven Nerayoff, complementing the broad discussions that ensued all weekend long.While the accuracy of the potential announcement remains a subject of speculation, the interest has shown that Deaton is one authority that many in the industry currently look to for detailed insights, analysis and review of the details emanating from high-profile cases in the industry.",
//         "authorName": "Godfrey Benjamin"
//     }
// ])