# Sentiment extractor

We expose an API around the google/bert model using a python FastAPI webserver.
This model serves as a base layer for a fine tuning made on the financial pharsebanks dataset (FinBERT model) in order to have the model trained on markets/financial lexicon.

## Download the model

In order to download the model execute the python script provided [here](./utils/download_model.py)

## Environnement variables

OPENSEARCH_URL=
OPENSEARCH_BASIC_AUTH=
OPENSEARCH_TOPIC: "Y3J5cHRvdml6"
MESSAGE_QUEUE_HOST_URL=""
MESSAGE_QUEUE_TOPIC=""
MQTT_AUTH_USERNAME=""
MQTT_AUTH_PASSWORD=""
MQTT_HOST_URL=""
MQTT_PUBLISH_ROOT_TOPIC=""
SENTIMENT_EXTRACTOR_WEBSERVICE_URL=""
SUMMARIZER_WEBSERVICE_URL=""
KEYWORDS_EXTRACTOR_WEBSERVICE_URL=""

## Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/sentiment-extractor/general)