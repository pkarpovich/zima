import { createRequire } from "module";
import { ConfigService, GrpcService, initErrorCatching } from "shared/services";
import { Config } from "./config/config.js";

import { YeelightService } from "./services/yeelight-service.js";
import { SimpleTriggerService } from "./services/simple-trigger-service.js";
import { SmartDevicesController } from "./controllers/smart-devices.controller.js";
import { SmartDevicesServiceDefinition } from "shared-grpc-services/services/smart_devices_service.js";

const require = createRequire(import.meta.url);

// eslint-disable-next-line import/no-commonjs
const devicesConfig = require("../devices.json");

const configService = new ConfigService({ config: Config() });

initErrorCatching(configService);

const yeelightService = new YeelightService(devicesConfig.lights);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const simpleTriggerService = new SimpleTriggerService(devicesConfig.triggers);

const smartDevicesController = new SmartDevicesController(yeelightService);

const grpcService = new GrpcService(configService);
grpcService.addService(SmartDevicesServiceDefinition, smartDevicesController);
await grpcService.start();
