import { createChannel, createClient, Channel, RawClient } from "nice-grpc";
import {
  CompatServiceDefinition,
  NormalizedServiceDefinition,
} from "nice-grpc/lib/service-definitions/index.js";

export type ServiceDefinition = CompatServiceDefinition;

export class GrpcClientService {
  createChannel(address: string): Channel {
    return createChannel(address);
  }

  createClient<Service extends CompatServiceDefinition>(
    definition: Service,
    channel: Channel
  ): RawClient<NormalizedServiceDefinition<Service>> {
    return createClient<Service>(definition, channel);
  }
}
