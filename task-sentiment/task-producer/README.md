# Task producer sentiment

This is the task producer module for sentiment analysis of the crypto news gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some component of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the producer service is to gather payloads sent by scrappers instances and to write messages to the message queue (rabbitmq).

This allows for some specific formatting of messages as well.

## Environnement variables

MESSAGE_QUEUE_HOST_URL=""
MESSAGE_QUEUE_TOPIC=""

## Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-producer-price/general)