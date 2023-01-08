/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "services.v1";

export interface SetRandomColorInDeviceRequest {
  zones: string[];
}

export interface SetRandomColorRequest {
  zones: string[];
}

export interface TurnOnDeviceRequest {
  zones: string[];
  brightness: number;
}

export interface TurnOffDeviceRequest {
  zones: string[];
}

export interface Response {
  status: string;
}

function createBaseSetRandomColorInDeviceRequest(): SetRandomColorInDeviceRequest {
  return { zones: [] };
}

export const SetRandomColorInDeviceRequest = {
  encode(message: SetRandomColorInDeviceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.zones) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetRandomColorInDeviceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetRandomColorInDeviceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.zones.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SetRandomColorInDeviceRequest {
    return { zones: Array.isArray(object?.zones) ? object.zones.map((e: any) => String(e)) : [] };
  },

  toJSON(message: SetRandomColorInDeviceRequest): unknown {
    const obj: any = {};
    if (message.zones) {
      obj.zones = message.zones.map((e) => e);
    } else {
      obj.zones = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<SetRandomColorInDeviceRequest>): SetRandomColorInDeviceRequest {
    const message = createBaseSetRandomColorInDeviceRequest();
    message.zones = object.zones?.map((e) => e) || [];
    return message;
  },
};

function createBaseSetRandomColorRequest(): SetRandomColorRequest {
  return { zones: [] };
}

export const SetRandomColorRequest = {
  encode(message: SetRandomColorRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.zones) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SetRandomColorRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetRandomColorRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.zones.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): SetRandomColorRequest {
    return { zones: Array.isArray(object?.zones) ? object.zones.map((e: any) => String(e)) : [] };
  },

  toJSON(message: SetRandomColorRequest): unknown {
    const obj: any = {};
    if (message.zones) {
      obj.zones = message.zones.map((e) => e);
    } else {
      obj.zones = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<SetRandomColorRequest>): SetRandomColorRequest {
    const message = createBaseSetRandomColorRequest();
    message.zones = object.zones?.map((e) => e) || [];
    return message;
  },
};

function createBaseTurnOnDeviceRequest(): TurnOnDeviceRequest {
  return { zones: [], brightness: 0 };
}

export const TurnOnDeviceRequest = {
  encode(message: TurnOnDeviceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.zones) {
      writer.uint32(10).string(v!);
    }
    if (message.brightness !== 0) {
      writer.uint32(16).int32(message.brightness);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TurnOnDeviceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTurnOnDeviceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.zones.push(reader.string());
          break;
        case 2:
          message.brightness = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TurnOnDeviceRequest {
    return {
      zones: Array.isArray(object?.zones) ? object.zones.map((e: any) => String(e)) : [],
      brightness: isSet(object.brightness) ? Number(object.brightness) : 0,
    };
  },

  toJSON(message: TurnOnDeviceRequest): unknown {
    const obj: any = {};
    if (message.zones) {
      obj.zones = message.zones.map((e) => e);
    } else {
      obj.zones = [];
    }
    message.brightness !== undefined && (obj.brightness = Math.round(message.brightness));
    return obj;
  },

  fromPartial(object: DeepPartial<TurnOnDeviceRequest>): TurnOnDeviceRequest {
    const message = createBaseTurnOnDeviceRequest();
    message.zones = object.zones?.map((e) => e) || [];
    message.brightness = object.brightness ?? 0;
    return message;
  },
};

function createBaseTurnOffDeviceRequest(): TurnOffDeviceRequest {
  return { zones: [] };
}

export const TurnOffDeviceRequest = {
  encode(message: TurnOffDeviceRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.zones) {
      writer.uint32(10).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TurnOffDeviceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTurnOffDeviceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.zones.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): TurnOffDeviceRequest {
    return { zones: Array.isArray(object?.zones) ? object.zones.map((e: any) => String(e)) : [] };
  },

  toJSON(message: TurnOffDeviceRequest): unknown {
    const obj: any = {};
    if (message.zones) {
      obj.zones = message.zones.map((e) => e);
    } else {
      obj.zones = [];
    }
    return obj;
  },

  fromPartial(object: DeepPartial<TurnOffDeviceRequest>): TurnOffDeviceRequest {
    const message = createBaseTurnOffDeviceRequest();
    message.zones = object.zones?.map((e) => e) || [];
    return message;
  },
};

function createBaseResponse(): Response {
  return { status: "" };
}

export const Response = {
  encode(message: Response, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== "") {
      writer.uint32(10).string(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.status = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Response {
    return { status: isSet(object.status) ? String(object.status) : "" };
  },

  toJSON(message: Response): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = message.status);
    return obj;
  },

  fromPartial(object: DeepPartial<Response>): Response {
    const message = createBaseResponse();
    message.status = object.status ?? "";
    return message;
  },
};

export type SmartDevicesServiceDefinition = typeof SmartDevicesServiceDefinition;
export const SmartDevicesServiceDefinition = {
  name: "SmartDevicesService",
  fullName: "services.v1.SmartDevicesService",
  methods: {
    setRandomColorInDevice: {
      name: "setRandomColorInDevice",
      requestType: SetRandomColorInDeviceRequest,
      requestStream: false,
      responseType: Response,
      responseStream: false,
      options: {},
    },
    setRandomColor: {
      name: "setRandomColor",
      requestType: SetRandomColorRequest,
      requestStream: false,
      responseType: Response,
      responseStream: false,
      options: {},
    },
    turnOnDevices: {
      name: "turnOnDevices",
      requestType: TurnOnDeviceRequest,
      requestStream: false,
      responseType: Response,
      responseStream: false,
      options: {},
    },
    turnOffDevices: {
      name: "turnOffDevices",
      requestType: TurnOffDeviceRequest,
      requestStream: false,
      responseType: Response,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface SmartDevicesServiceImplementation<CallContextExt = {}> {
  setRandomColorInDevice(
    request: SetRandomColorInDeviceRequest,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<Response>>;
  setRandomColor(request: SetRandomColorRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Response>>;
  turnOnDevices(request: TurnOnDeviceRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Response>>;
  turnOffDevices(request: TurnOffDeviceRequest, context: CallContext & CallContextExt): Promise<DeepPartial<Response>>;
}

export interface SmartDevicesServiceClient<CallOptionsExt = {}> {
  setRandomColorInDevice(
    request: DeepPartial<SetRandomColorInDeviceRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<Response>;
  setRandomColor(
    request: DeepPartial<SetRandomColorRequest>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<Response>;
  turnOnDevices(request: DeepPartial<TurnOnDeviceRequest>, options?: CallOptions & CallOptionsExt): Promise<Response>;
  turnOffDevices(request: DeepPartial<TurnOffDeviceRequest>, options?: CallOptions & CallOptionsExt): Promise<Response>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
