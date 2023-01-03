package config

import (
	"github.com/kelseyhightower/envconfig"
	"log"
)

type Config struct {
	AmqpServerUrl string `envconfig:"AMQP_SERVER_URL"`
	ChannelName   string `envconfig:"AMQP_MEETINGS_QUEUE_NAME"`
}

func GetConfig() (cfg Config) {
	err := envconfig.Process("", &cfg)
	if err != nil {
		log.Fatalf("Can't parse config file: %v", err)
	}

	return cfg
}