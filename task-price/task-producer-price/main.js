const express = require('express');
const { authorizeBodyParams, requireBodyParams } = require('./middlewares/validate.middlewares');
const { errorHandler } = require('./middlewares/error-handler.middlewares');
const { MessageBroker } = require('./src/MessageQueue');
const app = express();

const {
    MESSAGE_QUEUE_HOST_URL,
    MESSAGE_QUEUE_TOPIC,
} = process.env;



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
            data: true,
            timestamp: true
        }),
        async (req, res) => {
            try {
                const { tag, data, timestamp } = req.body
                // console.log(JSON.stringify(data, null, 4))
                // formatting data
                const names = data.filter((e) => e.hasOwnProperty('name'))
                const prices = data.filter((e) => e.hasOwnProperty('price'))
                const volumes = data.filter((e) => e.hasOwnProperty('volume'))
                const volumeUnits = data.filter((e) => e.hasOwnProperty('volumeUnit'))
                const volumesInterpreted = volumes.map((e, index) => ({
                    volume: volumes[index].volume && volumeUnits[index].volumeUnit ? volumes[index].volume * volumeUnits[index].volumeUnit : 0
                }))
                const formattedData = names.map((e, index) => ({ ...e, price: prices[index].price ? prices[index].price : 0, volume: volumesInterpreted[index].volume ? volumesInterpreted[index].volume : 0, timestamp, tag }))
                // killing job early freeing resources for next job in line
                res.status(200).json({
                    message: `received ${formattedData.length} items`
                })

                console.log(`received ${formattedData.length} new items to add to process queue`)

                // add data to process queue
                for (const item of formattedData) {
                    // console.log(`data payload ${JSON.stringify(item, null, 4)}`)
                    if (item.price && item.volume && item.name && item.timestamp) {
                        messageBroker.addMessage(JSON.stringify(item))
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

