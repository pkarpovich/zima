import {
  SmartDevicesServiceImplementation,
  Response,
  DeepPartial,
  TurnOnDeviceRequest,
  TurnOffDeviceRequest,
  SetRandomColorRequest,
  SetRandomColorInDeviceRequest,
} from "shared-grpc-services/services/smart_devices_service.js";
import { YeelightService } from "../services/yeelight-service.js";

export class SmartDevicesController
  implements SmartDevicesServiceImplementation
{
  constructor(private readonly yeelightService: YeelightService) {}

  async turnOnDevices(
    request: TurnOnDeviceRequest
  ): Promise<DeepPartial<Response>> {
    await this.yeelightService.setPower(
      true,
      request.zones,
      request.brightness
    );

    return {
      status: "OK",
    };
  }

  async turnOffDevices(
    request: TurnOffDeviceRequest
  ): Promise<DeepPartial<Response>> {
    await this.yeelightService.setPower(false, request.zones);

    return {
      status: "OK",
    };
  }

  async setRandomColor(
    request: SetRandomColorRequest
  ): Promise<DeepPartial<Response>> {
    await this.yeelightService.setRandomColor(request.zones);

    return {
      status: "OK",
    };
  }

  async setRandomColorInDevice(
    request: SetRandomColorInDeviceRequest
  ): Promise<DeepPartial<Response>> {
    await this.yeelightService.setRandomColorInEveryLight(request.zones);

    return {
      status: "OK",
    };
  }
}
