const express = require("express");
const {
    authorizeBodyParams,
    requireBodyParams,
} = require("./middlewares/validate.middlewares");
const { errorHandler } = require("./middlewares/error-handler.middlewares");
const app = express();

const {
    KAFKA_BROKERS,
    KAFKA_SASL_USERNAME,
    KAFKA_SASL_PASSWORD,
    KAFKA_CLIENT_ID,
    KAFKA_TOPIC
} = process.env;

const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: KAFKA_BROKERS.split(","),
    sasl: {
        mechanism: "scram-sha-512",
        username: KAFKA_SASL_USERNAME,
        password: KAFKA_SASL_PASSWORD,
    },
});

const producer = kafka.producer();

producer.connect().then(() => {
    console.log(`kafka producer successfully connected`);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post(
        "/",
        authorizeBodyParams({
            tag: true,
            data: true,
            timestamp: true,
        }),
        requireBodyParams({
            tag: true,
            data: true,
            timestamp: true,
        }),
        async (req, res) => {
            try {
                const { tag, data, timestamp } = req.body;
                // console.log(JSON.stringify(data, null, 4))
                // formatting data
                const names = data.filter((e) => e.hasOwnProperty("name"));
                const prices = data.filter((e) => e.hasOwnProperty("price"));
                const volumes = data.filter((e) => e.hasOwnProperty("volume"));
                const volumeUnits = data.filter((e) => e.hasOwnProperty("volumeUnit"));
                const volumesInterpreted = volumes.map((e, index) => ({
                    volume:
                        volumes[index].volume && volumeUnits[index].volumeUnit
                            ? volumes[index].volume * volumeUnits[index].volumeUnit
                            : 0,
                }));
                const formattedData = names.map((e, index) => ({
                    ...e,
                    price: prices[index].price ? prices[index].price : 0,
                    volume: volumesInterpreted[index].volume
                        ? volumesInterpreted[index].volume
                        : 0,
                    timestamp,
                    tag,
                }));
                // killing job early freeing resources for next job in line
                res.status(200).json({
                    message: `received ${formattedData.length} items`,
                });

                console.log(
                    `received ${formattedData.length} new items to add to process queue`
                );

                await producer.send({
                    topic: KAFKA_TOPIC,
                    messages: formattedData
                        .filter(
                            (item) => item.price && item.volume && item.name && item.timestamp
                        )
                        .map((item) => ({ key: item.name, value: JSON.stringify(item) })),
                });
            } catch (error) {
                console.log(error);
                console.log(`error adding message to process queue`);
            }
        }
    );

    app.use(errorHandler);

    app.listen(9000, "0.0.0.0", () => {
        console.log(`server running on port 9000`);
    });
});