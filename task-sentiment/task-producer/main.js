const express = require('express');
const { OpenSearchStorage } = require('./src/OpenSearchStorage');
const { authorizeBodyParams, requireBodyParams } = require('./middlewares/validate.middlewares');
const { errorHandler } = require('./middlewares/error-handler.middlewares');
const { MessageBroker } = require('./src/MessageQueue');
const app = express();

const {
    OPENSEARCH_URL,
    OPENSEARCH_BASIC_AUTH,
    OPENSEARCH_TOPIC,
    MESSAGE_QUEUE_HOST_URL,
    MESSAGE_QUEUE_TOPIC,
} = process.env;


const OPENSEARCH_CLIENT = new OpenSearchStorage({
    topic: OPENSEARCH_TOPIC,
    rootUrl: OPENSEARCH_URL,
    basicAuth: OPENSEARCH_BASIC_AUTH
})


MessageBroker.init({ brokerUrl: MESSAGE_QUEUE_HOST_URL, topic: MESSAGE_QUEUE_TOPIC }).then((messageBroker) => {
    console.log(`message queue broker connection opened.`)
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.post('/',
        authorizeBodyParams({
            tag: true,
            data: true,
            timestamp: true,
        }),
        requireBodyParams({
            tag: true,
            data: true
        }),
        async (req, res) => {
            try {
                const { tag, data } = req.body
                // killing job early freeing resources for next job in line
                res.status(200).json({
                    message: `received ${data.length} articles to qualify`
                })
                // scrapping results may contain results already registered
                const newData = await Promise.all(data.filter(async (item) => {
                    if (item?.title && item?.content) {
                        const existingEntries = await OPENSEARCH_CLIENT.search({
                            title: item.title
                        });
                        return !existingEntries.length
                    }
                    return false;
                }))

                console.log(`received ${newData.length} new articles to add to process queue`)

                // add data to process queue
                for (const item of newData) {
                    console.log(`data payload ${JSON.stringify(item, null, 4)}`)
                    if (item?.title && item?.content) {
                        messageBroker.addMessage(JSON.stringify({ ...item, tag }))
                    }
                }

            } catch (error) {
                console.log(error)
                console.log((`error adding message to process queue`))
            }
        })

    app.use(errorHandler)

    app.listen(9000, '0.0.0.0', () => {
        console.log(`server running on port 9000`)
    })
})

