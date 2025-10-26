import { Yeelight } from "yeelight-node";
import { LoggerService } from "shared/services";
import { Nullable } from "shared/types";
import { retry } from "../utils/retry.js";

type Arr = readonly unknown[];

export class YeelightDevice {
    readonly id: string;

    instance: Nullable<Yeelight> = null;

    private readonly logService: LoggerService;

    private connectionConfig: { ip: string; port: number } | null = null;

    constructor({ id }: { id: string }) {
        this.id = id;
        this.logService = new LoggerService();
        this.logService.setDefaultContext(id);
    }

    async connect({ ip: address, port }: { ip: string; port: number }) {
        this.connectionConfig = { ip: address, port };
        return retry(this.connectToLocalInstance(address, port));
    }

    async reconnect() {
        if (!this.connectionConfig) {
            throw new Error("Cannot reconnect: no connection config available");
        }
        this.logService.info("Attempting to reconnect...");
        return this.connect(this.connectionConfig);
    }

    async setBrightness(b: number) {
        this.logService.info(`Try to change brightness to ${b} %`);
        return this.setProp(this.instance?.set_bright, b);
    }

    async setHsv(hue: number, sat: number) {
        this.logService.info(`Try to change color to hue ${hue} and sat ${sat}`);
        return this.setProp(this.instance?.set_hsv, hue, sat, "sudden", 400);
    }

    async setTemperature(mired: number) {
        const kelvin = 10 ** 6 / mired;
        this.logService.info(`Try to change temperature to ${kelvin} K`);
        return this.setProp(this.instance?.set_ct_abx, kelvin, "sudden", 400);
    }

    async setColor(rgb: [number, number, number]) {
        this.logService.info(`Try to change color to rgb ${rgb}`);

        return this.setProp(this.instance?.set_rgb, rgb);
    }

    async setPower(p: boolean) {
        this.logService.info(`Try to change power to ${p}`);
        return this.setProp(this.instance?.set_power, p ? "on" : "off", "sudden");
    }

    async getBrightness(): Promise<number> {
        return this.getProp<number>("bright", 0);
    }

    async getPower(): Promise<boolean> {
        const result = await this.getProp<string>("power", "off");
        return result === "on";
    }

    private connectToLocalInstance(address: string, port: number) {
        return () =>
            // eslint-disable-next-line no-async-promise-executor
            new Promise(async (resolve, reject) => {
                this.logService.info(`Try to connect to local yeelight device, ip: ${address}, port: ${port}`);

                try {
                    this.instance = new Yeelight({ ip: address, port });

                    await this.instance.get_prop("power");
                    this.logService.success(`Yeelight device connected, ip: ${address}, port: ${port}`);
                    resolve(this.instance);
                } catch (e) {
                    this.logService.error(`Can't connect to yeelight device, ip: ${address}, port: ${port}, error`);
                    this.logService.error(e as Error);

                    reject(e);
                }
            });
    }

    private processGetResponse(resp: string) {
        return JSON.parse(resp);
    }

    private async getProp<T>(name: string, defaultValue: T): Promise<T> {
        try {
            const resp = await this.instance?.get_prop(name);
            const { result } = this.processGetResponse(resp as string);

            return result[0];
        } catch (e) {
            this.logService.error(`Can't get property ${name} from yeelight device, error: `);
            this.logService.error(e as Error);
        }

        return defaultValue;
    }

    private isConnectionError(error: any): boolean {
        const errorMessage = error?.message || String(error);
        return errorMessage.includes('ECONNRESET') ||
               errorMessage.includes('EPIPE') ||
               errorMessage.includes('ENOTCONN');
    }

    private async handleConnectionError<T extends Arr, R>(f?: (...args: [...T]) => R, ...headArgs: T) {
        this.logService.error(`Connection lost, attempting to reconnect...`);

        try {
            await this.reconnect();
            this.logService.success(`Reconnected successfully, retrying command`);
            return f?.bind(this.instance)(...headArgs);
        } catch (reconnectError) {
            this.logService.error(`Reconnection failed`);
            this.logService.error(reconnectError as Error);
            throw reconnectError;
        }
    }

    private async setProp<T extends Arr, R>(f?: (...args: [...T]) => R, ...headArgs: T) {
        try {
            return f?.bind(this.instance)(...headArgs);
        } catch (e: any) {
            if (this.isConnectionError(e)) {
                return this.handleConnectionError(f, ...headArgs);
            }

            this.logService.error(`Can't set property ${f?.name} to ${headArgs} on yeelight device, error: `);
            this.logService.error(e as Error);
            throw e;
        }
    }
}
