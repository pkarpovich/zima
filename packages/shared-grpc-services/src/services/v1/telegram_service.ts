/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal.js";

export const protobufPackage = "services.v1";

export interface CallRequest {
  token: string;
  chatId: string;
  text: string;
  isSilent: boolean;
}

export interface CallResponse {
  status: string;
}

function createBaseCallRequest(): CallRequest {
  return { token: "", chatId: "", text: "", isSilent: false };
}

export const CallRequest = {
  encode(message: CallRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    if (message.chatId !== "") {
      writer.uint32(18).string(message.chatId);
    }
    if (message.text !== "") {
      writer.uint32(26).string(message.text);
    }
    if (message.isSilent === true) {
      writer.uint32(32).bool(message.isSilent);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CallRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCallRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.token = reader.string();
          break;
        case 2:
          message.chatId = reader.string();
          break;
        case 3:
          message.text = reader.string();
          break;
        case 4:
          message.isSilent = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): CallRequest {
    return {
      token: isSet(object.token) ? String(object.token) : "",
      chatId: isSet(object.chatId) ? String(object.chatId) : "",
      text: isSet(object.text) ? String(object.text) : "",
      isSilent: isSet(object.isSilent) ? Boolean(object.isSilent) : false,
    };
  },

  toJSON(message: CallRequest): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    message.chatId !== undefined && (obj.chatId = message.chatId);
    message.text !== undefined && (obj.text = message.text);
    message.isSilent !== undefined && (obj.isSilent = message.isSilent);
    return obj;
  },

  fromPartial(object: DeepPartial<CallRequest>): CallRequest {
    const message = createBaseCallRequest();
    message.token = object.token ?? "";
    message.chatId = object.chatId ?? "";
    message.text = object.text ?? "";
    message.isSilent = object.isSilent ?? false;
    return message;
  },
};

function createBaseCallResponse(): CallResponse {
  return { status: "" };
}

export const CallResponse = {
  encode(message: CallResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.status !== "") {
      writer.uint32(10).string(message.status);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CallResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCallResponse();
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

  fromJSON(object: any): CallResponse {
    return { status: isSet(object.status) ? String(object.status) : "" };
  },

  toJSON(message: CallResponse): unknown {
    const obj: any = {};
    message.status !== undefined && (obj.status = message.status);
    return obj;
  },

  fromPartial(object: DeepPartial<CallResponse>): CallResponse {
    const message = createBaseCallResponse();
    message.status = object.status ?? "";
    return message;
  },
};

export type TelegramServiceDefinition = typeof TelegramServiceDefinition;
export const TelegramServiceDefinition = {
  name: "TelegramService",
  fullName: "services.v1.TelegramService",
  methods: {
    call: {
      name: "call",
      requestType: CallRequest,
      requestStream: false,
      responseType: CallResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

export interface TelegramServiceImplementation<CallContextExt = {}> {
  call(request: CallRequest, context: CallContext & CallContextExt): Promise<DeepPartial<CallResponse>>;
}

export interface TelegramServiceClient<CallOptionsExt = {}> {
  call(request: DeepPartial<CallRequest>, options?: CallOptions & CallOptionsExt): Promise<CallResponse>;
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
