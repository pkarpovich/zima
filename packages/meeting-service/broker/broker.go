package broker

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/streadway/amqp"
	"log"
)

type RabbitMQ struct {
	connection *amqp.Connection
	channel    *amqp.Channel
}

func CreateBroker(url string) (*RabbitMQ, error) {
	connection, err := createConnection(url)
	if err != nil {
		return nil, err
	}

	channel, err := createChannel(connection)
	if err != nil {
		return nil, err
	}

	return &RabbitMQ{connection, channel}, nil
}

func createConnection(amqpServerURL string) (*amqp.Connection, error) {
	connectRabbitMQ, err := amqp.Dial(amqpServerURL)
	if err != nil {
		return nil, err
	}

	return connectRabbitMQ, nil
}

func createChannel(connection *amqp.Connection) (*amqp.Channel, error) {
	channelRabbitMQ, err := connection.Channel()
	if err != nil {
		return nil, err
	}

	return channelRabbitMQ, nil
}

func (r RabbitMQ) CloseConnection() error {
	return r.connection.Close()
}

func (r RabbitMQ) CloseChannel() error {
	return r.channel.Close()
}

func (r RabbitMQ) SubscribeToChannel(queueName string) (<-chan amqp.Delivery, error) {
	messages, err := r.channel.Consume(
		queueName, // queue name
		"",        // consumer
		true,      // auto-ack
		false,     // exclusive
		false,     // no local
		false,     // no wait
		nil,       // arguments
	)
	if err != nil {
		return nil, err
	}

	log.Println("Successfully connected to RabbitMQ")
	log.Println("Waiting for messages")

	return messages, nil
}

func (r RabbitMQ) DeclareQueue(queueName string) (*amqp.Queue, error) {
	q, err := r.channel.QueueDeclare(
		queueName, // name
		true,       // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // arguments
	)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Failed to declare a queue %v", err))
	}

	err = r.channel.Qos(
		1,     // prefetch count
		0,     // prefetch size
		false, // global
	)
	if err != nil {
		return nil, errors.New(fmt.Sprintf("Failed to set QoS %v", err))
	}

	return &q, nil
}

func (r RabbitMQ) ReplyToChannel(body interface{}, replyTo, correlationId string) error {
	str, err := json.Marshal(body)
	if err != nil {
		return errors.New(fmt.Sprintf("Failed to create message body %v", err))
	}

	err = r.channel.Publish(
		"",
		replyTo,
		false,
		false,
		amqp.Publishing{
			Body:    str,
			CorrelationId: correlationId,
		})
	if err != nil {
		return errors.New(fmt.Sprintf("Failed to send into chanel %v", err))
	}

	return nil
}
