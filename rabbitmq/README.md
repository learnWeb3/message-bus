# RabbitMQ Kubernetes Operator

## For crypto news 

The processing of documents produced by the scrapper involves heavy computing IA tasks such as sentiment qualification, summary generation and keywords extraction.
As we have limited resources in the cluster hosting our infrastructure for the cryptoviz project we decided to deploy a message queue with one goal, being able to register task events that will be consumed by task processors as they are available in the system, allowing to have better control over resources consumption.

## For crypto prices 

We scrappe crypto prices every minutes which might overload the system and make services responsible for data registration unavailable for a certain amount of time as we work in a constrained environnement with no ability to scale vertically as we might want to fix costs of the infrastructure (we could scale horizontally and then add more node to the cluster otherwise). In order to tacke this problem and preserve our resources and services health we choose to implement a simple message bus/queue system.

Rabbit MQ will serve in this context as a message bus to deliver message to instance(s) of task-consumer web services.

## Architecture 

Crawler webservice -> [HTTP webhook call] ->  Task producer webservice -> [AMQP message] -> RabbitMQ -> [AMQP message] -> Task consumer webservice

## Usaeful commands

```bash
rabbitmqctl list_queue
rabbitmqtctl purge <queuname>
```

## Install the operator

```bash
kubectl apply -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

## Uninstall the operator
```bash
kubectl delete -f "https://github.com/rabbitmq/cluster-operator/releases/latest/download/cluster-operator.yml"
```

[github](https://github.com/rabbitmq/cluster-operator/blob/main/docs/examples/)