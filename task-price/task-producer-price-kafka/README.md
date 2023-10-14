# Task producer price kafka

This is the task producer module for the price feed gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some components of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the producer service is to gather payloads sent by scrappers instances and to write messages to the message queue (kafka, segragating data inside partition by coin name).

With this setup and the use of kafka as a distributted message queue we guarantee the order of message/crypto inside the pipeline with ability to distribute the load in the downstream webservice consuming the data.

This allows for some specific formatting of messages as well.

## Environnement variables

WEBSOCKET_PORT
KAFKA_SASL_USERNAME
NODE_TLS_REJECT_UNAUTHORIZED
KAFKA_BROKERS
KAFKAJS_NO_PARTITIONER_WARNING
KAFKA_TOPIC
KAFKA_SASL_PASSWORD

## Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-producer-price/general)
