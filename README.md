# Cryptoviz project

This project has for main goal the demonstration the usage/need of a message queue/message bus in order to bufferize a high frequency message stream to prevent data losses, manage resources consumptions and requirements in a constrained environnement.

This project emphasize the need of message queue/message bus for post processing in downstream (AI webservice processing) wich thighten furthermore the resources available for other webservices and require efficient RAM and CPU management to prevent unwanted webservice crashes and service unavailability.

## [Global Architecture](https://lucid.app/lucidchart/a63640f3-302e-4be3-b97a-377150e65bb5/edit?viewport_loc=38%2C17%2C2579%2C1283%2C0_0&invitationId=inv_da990175-86b5-44e4-a53e-95c7b5b7f238)

## [UML Sequence diagram](https://lucid.app/lucidchart/70003df8-5de8-4109-a0e3-8bfab8a0ef94/edit?viewport_loc=-267%2C-59%2C3970%2C1975%2C0_0&invitationId=inv_7de0c604-9411-474d-838c-565ee0023041)

The UML sequence diagram illustrate the sequence of message sent across the various entities composing the system for the crypto-price data gathering.

## [CryptoViz Scrapper](./crawler/)

This module is a web scrapper allowing to scrappe continuously crypto news and prices in order to feed data to the analytics systems components for the crypto viz project

This repository contains code for a general purpose scrapper confifgurable using a simple config.yaml file.
It leverages selenium library in order to crawl client side only websites.
The configuration file must be mounted at /usr/share/crawler/config path inside the container.
It offers a declarative interface to instruct the crawler what to do.
The following actions are available through the crawler config.yaml file.
- navigate: go to a specific url 
- checkPresence: wait for a cssSelector until a specific timeout 
- extract: target a specific cssSelector and extract href and/or text attribute
The extracted data is made available outside the container using an HTTP POST webhook call that can be configured using the configuration file.

The scrapper uses external selenium webdriver server: 

[SeleniumHQ/Selenium](https://github.com/SeleniumHQ/selenium)

### Environnement variables

Environnement variables are used in debug mode only and allow to set a custom selenium binary webdriver path.

```bash
# configure a path for the selenium webdriver binary
ENV SELENIUM_SERVER_URL="<URL TO YOUR SELENIUM SERVER URL>"
ENV WEBDRIVER_BINARY_PATH=""
# configure the headless mode
ENV DEBUG=0
```

### Configuration file

Here is a little example of the config.yaml file for the u.today website: 

```yaml
domain: "u.today"
tasks:
  - type: "navigate"
    params:
      url: "https://u.today/latest-cryptocurrency-news"
  - type: "checkPresence"
    params:
      timeout: 1000
      cssSelector: "body > div.page-container.container > div > main"
  - type: "extract"
    params:
      cssSelector: "main .category-item .category-item__title-link"
      extractAttributes:
        text:
          as: "title"
        href:
          as: "link"
    tasks:
      - type: "navigate"
        params:
          url: "$link"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .article_main-info__humble"
      - type: "extract"
        params:
          cssSelector: "main .article .article_main-info__humble .time"
          extractAttributes:
            text:
              as: "publishedAt"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .article__content"
      - type: "extract"
        params:
          cssSelector: "main .article .article__content"
          extractAttributes:
            text:
              as: "content"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author .about-author_name"
      - type: "extract"
        params:
          cssSelector: "main .article .about-author .about-author_name"
          extractAttributes:
            text:
              as: "authorName"
      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author .about-author_name"
      - type: "extract"
        params:
          cssSelector: "main .article .about-author .about-author_name"
          extractAttributes:
            text:
              as: "authorName"

      - type: "checkPresence"
        params:
          timeout: 1000
          cssSelector: "main .article .about-author .social"
      - type: "extract"
        params:
          cssSelector: "main .article .about-author .social .social__link"
          extractAttributes:
            href:
              as: "authorLink"

webhook:
  url: "http://localhost:9000"
  headers:
    Authorization: "Basic xxxx"

```


### Deployment 

k8s manifests have been crafted leveraging kubernetes cronjob api/resource in order to schedule the scrappers.

[k8s manifest](./k8s/)

### Warning

The docker image is built for ARM architecture and is not compatible for AMD.

### Scrapped website

- [UToday - news](https://u.today)
- [Coindesk - news](https://www.coindesk.com/)
- [cryptocompare - prices](https://cryptocompare.com)

### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/crawler/general)

## [RabbitMQ](./rabbitmq/)

### For crypto news 

The processing of documents produced by the scrapper involves heavy computing IA tasks such as sentiment qualification, summary generation and keywords extraction.
As we have limited resources in the cluster hosting our infrastructure for the cryptoviz project we decided to deploy a message queue with one goal, being able to register task events that will be consumed by task processors as they are available in the system, allowing to have better control over resources consumption.

### For crypto prices 

We scrappe crypto prices every minutes which might overload the system and make services responsible for data registration unavailable for a certain amount of time as we work in a constrained environnement with no ability to scale vertically as we might want to fix costs of the infrastructure (we could scale horizontally and then add more node to the cluster otherwise). In order to tacke this problem and preserve our resources and services health we choose to implement a simple message bus/queue system.

Rabbit MQ will serve in this context as a message bus to deliver message to instance(s) of task-consumer web services.

### Architecture 

Crawler webservice -> [HTTP webhook call] ->  Task producer webservice -> [AMQP message] -> RabbitMQ -> [AMQP message] -> Task consumer webservice

### Useful commands

```bash
rabbitmqctl list_queue
rabbitmqtctl purge <queuname>
```

### Install the operator

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

### Uninstall the operator
```bash
kubectl delete -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

[github](https://github.com/rabbitmq/cluster-operator/blob/main/docs/examples/)



## Opensearch

We have chosen the opensearch solution to store our data.
This choice has been motivated by the following features of the opensearch solution :
- Highly efficient data indexing of time series and strings, through replications, partionning and sharding
- Resilient distributed architecture
- Internal RBAC system allowing to setup third party authentication server allowing to expose database securely over the internet and perform aggregation queries direcly on the web interface thus eliminating latency generated by having to make request server side.
- Ability to setup transforms and/or rollups jobs to be able to populate new indices with summarized data from a source indice.

The following roles, internal users and roles mapping have been set up with their policies:

- cryptoviz-dashboard
  - READ permission to cryptoviz and cryptoviz-* indices
- cryptoviz-scrapper
  - READ + WRITE permissions to cryptoviz and cryptoviz-* indices

The following transforms jobs have been set up in order to improve query performances from the dashboards displaying data in near realtime (1min data refresh) :

- cryptoviz-price-5min: aggregation of the cryptoviz-price index content for a 5 min timeframe
- cryptoviz-price-15min: aggregation of the cryptoviz-price index content for a 15 min timeframe
- cryptoviz-price-30min: aggregation of the cryptoviz-price index content for a 3O min timeframe
- cryptoviz-price-1hour: aggregation of the cryptoviz-price index content for a 1 hour timeframe
- cryptoviz-price-4hour: aggregation of the cryptoviz-price index content for a 4 hour timeframe
- cryptoviz-price-1day: aggregation of the cryptoviz-price index content for a 1 day timeframe
- cryptoviz-price-1week: aggregation of the cryptoviz-price index content for a 1 week timeframe
  
## Keycloak

Keycloak will serve as a third party authorization server.
We have set up a realm with a public openid client and customs roles that are mapped to opensearch internal users and roles.
The following roles have been set up:

- cryptoviz-dashboard
- cryptoviz-scrapper

## MQTT broker 

The MQTT protocol has been chosen over simple websocket in order to notify clients (dashboards) of new data availability.
The following have made us choose it instead of simple websocket solution : 
- dynamic topic
- nested subscription
- Quality of service
- Raw binary data transport 
- Distributed broker architecture using Mongo MQ emitter (change stream API)

Data is published on the following topics with each time the ability to subscribe to a refresh notification or the data stream itself: 

- cryptoviz/price-feed/<COIN NAME>/notify/refresh
- cryptoviz/price-feed/<COIN NAME>/notify/data

- cryptoviz/sentiment/<TAG>/notify/refresh
- cryptoviz/sentiment/<TAG>/notify/data

A specific user has been setup with permissions read/write to the cryptoviz/* topic.  

## Sentiment analysis

### [Task producer sentiment](./task-sentiment/task-producer/)

This is the task producer module for sentiment analysis of the crypto news gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some component of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the producer service is to gather payloads sent by scrappers instances and to write messages to the message queue (rabbitmq).

This allows for some specific formatting of messages as well.

#### Environnement variables

MESSAGE_QUEUE_HOST_URL=""
MESSAGE_QUEUE_TOPIC=""

#### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-producer/general)

### [Task consumer sentiment](./task-sentiment/task-consumer/)

This is the task consumer module for sentiment analysis of the crypto news gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some component of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the consumer service is to listen to new messages/events in the message queue (rabbitmq) and to process the data in order to extract useful information for the sentiment analysis, then save it to disk storage (database) and notify web clients (dashboard) that new data is available.

This webservice makes the link between AI models exposed internally through HTTP REST API, a disk storage database solution (opensearch) and an internet exposed server allowing for bidirectionnal communication (MQTT broker).

This webservice is at the very heart of the all system.

The following webservices are linked to this consumer sentiment webservice:

- keywords extractor 
- summarizer
- sentiment extractor
- storage (database)
- bidirectionnal message transport layer (MQTT broker)

#### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-consumer/general)

### AI Models

#### [Keywords extractor](./keywords-extractor/)

We expose an API around the spacy en_core_web_sm model using a python FastAPI webserver.

##### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/keywords-extractor/general)

#### [Summarizer](./summarizer/)

We expose an API around the facebook/bart-large-cnn model using a python FastAPI webserver.

##### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/summarizer/general)

#### [Sentiment extractor](./sentiment-extractor/)

We expose an API around the google/bert model using a python FastAPI webserver.
This model serves as a base layer for a fine tuning made on the financial pharsebanks dataset (FinBERT model) in order to have the model trained on markets/financial lexicon.

#### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/sentiment-extractor/general)

#### Environnement variables

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


## Price analysis

### [Task producer price](./task-price/task-producer-price/)

This is the task producer module for the price feed gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some components of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the producer service is to gather payloads sent by scrappers instances and to write messages to the message queue (rabbitmq).

This allows for some specific formatting of messages as well.


#### Environnement variables

MESSAGE_QUEUE_HOST_URL=""
MESSAGE_QUEUE_TOPIC=""

#### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-producer-price/general)

### [Task consumer price](./task-price/task-consumer-price/)

This is the task consumer module for price analysis of the crypto price feed gathered by the scrappers.
The design of the whole system has been crafted with one purpose in mind flexibility and the ability to reuse some component of the project thus separating modules by concerns.

The scrapper does not know anything about the storage layer nor the bus message it is configurable with a simple HTTP POST endpoint (webhook) in order to delegate this task to a dedicated service.

The purpose of the consumer service is to listen to new messages/events in the message queue (rabbitmq) and to process the data in order to extract useful information for the sentiment analysis, then save it to disk storage (database) and notify web clients (dashboard) that new data is available.

This webservice makes the link between a disk storage database solution (opensearch) and an internet exposed server allowing for bidirectionnal communication (MQTT broker).

This webservice is at the very heart of the all system.

The following webservices are linked to this consumer webservice:

- storage (database)
- bidirectionnal message transport layer (MQTT broker)

#### Environnement variables

OPENSEARCH_URL=""
OPENSEARCH_BASIC_AUTH=""
OPENSEARCH_TOPIC=""
MESSAGE_QUEUE_HOST_URL=""
MESSAGE_QUEUE_TOPIC=""
MQTT_AUTH_USERNAME=""
MQTT_AUTH_PASSWORD=""
MQTT_HOST_URL=""
MQTT_PUBLISH_ROOT_TOPIC=""

#### Docker image

[Dockerhub](https://hub.docker.com/repository/docker/antoineleguillou/task-consumer-price/general)

## [Dashboard](./dashboard/)

Next js dashboard application secured using OPENID connect authenticating users using the keycloak authentication server.