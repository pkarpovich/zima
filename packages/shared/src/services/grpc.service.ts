import { createServer } from "nice-grpc";
import { CompatServiceDefinition } from "nice-grpc/lib/service-definitions/index.js";
import { ServiceImplementation } from "nice-grpc/lib/server/ServiceImplementation.js";

import { ConfigService } from "./config.service.js";

export class GrpcService {
  private readonly server = createServer();

  constructor(private readonly configService: ConfigService<unknown>) {}

  public addService<Service extends CompatServiceDefinition>(
    definition: Service,
    implementation: ServiceImplementation<Service>
  ): void {
    this.server.add<Service>(definition, implementation);
  }

  public async start(): Promise<void> {
    const address = this.configService.get<string>("grpc.address");

    await this.server.listen(address);
  }
}
