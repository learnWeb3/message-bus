# Task consumer price

This is the task consumer module for price analysis of the crypto price feed gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some component of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the consumer service is to listen to new messages/events in the message queue (rabbitmq) and to process the data in order to extract useful information for the sentiment analysis, then save it to disk storage (database) and notify web clients (dashboard) that new data is available.

This webservice makes the link between a disk storage database solution (opensearch) and an internet exposed server allowing for bidirectionnal communication (MQTT broker).

This webservice is at the very heart of the all system.

The following webservices are linked to this consumer webservice:

- storage (database)
- bidirectionnal message transport layer (MQTT broker)

## Environnement variables

OPENSEARCH_URL=""
OPENSEARCH_BASIC_AUTH=""
OPENSEARCH_TOPIC=""
MESSAGE_QUEUE_HOST_URL=""
MESSAGE_QUEUE_TOPIC=""
MQTT_AUTH_USERNAME=""
MQTT_AUTH_PASSWORD=""
MQTT_HOST_URL=""
MQTT_PUBLISH_ROOT_TOPIC=""

## Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-consumer-price/general)