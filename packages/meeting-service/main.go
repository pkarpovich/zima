package main

import (
	"errors"
	"log"
	"meeting-service/broker"
	"meeting-service/config"
	"meeting-service/provider"
)

type Providers string

const (
	Google Providers = "google_meet"
)

func main() {
	cfg := config.GetConfig()

	rabbitMQ, err := broker.CreateBroker(cfg.AmqpServerUrl)
	if err != nil {
		log.Fatalf("Can't create broker %v", err)
	}

	defer rabbitMQ.CloseConnection()

	_, err = rabbitMQ.DeclareQueue(cfg.ChannelName)
	if err != nil {
		log.Fatalf("Can't declare queue %v", err)
	}

	messages, err := rabbitMQ.SubscribeToChannel(cfg.ChannelName)
	if err != nil {
		log.Fatalf("Can't subscibe to channel %v", err)
	}

	defer rabbitMQ.CloseChannel()

	forever := make(chan bool)

	go func() {
		for message := range messages {
			log.Printf(" > Received message: %s\n", message.Body)

			meetingProvider, err := getMeetingProvider(Providers(message.Body))
			if err != nil {
				log.Printf("[ERROR] Can't create meeting provider %v", err)
			}

			meetingUrl := meetingProvider.Create()
			log.Printf("Meeting with link %s created, reply to %s", meetingUrl, message.ReplyTo)

			resp := struct {
				MeetingUrl string `json:"meetingUrl"`
			}{
				meetingUrl,
			}

			err = rabbitMQ.ReplyToChannel(resp, message.ReplyTo, message.CorrelationId)
			if err != nil {
				log.Printf("[ERROR] Can't to sent into channel %v", err)
			}
		}
	}()

	<-forever
}

func getMeetingProvider(providerType Providers) (provider.MeetingProvider, error) {
	switch providerType {
	case Google:
		return provider.GoogleMeetProvider{}, nil
	}

	return nil, errors.New("meeting provider not found")
}
