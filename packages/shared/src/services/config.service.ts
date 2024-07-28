import { resolve } from "node:path";
import * as process from "node:process";
import * as dotenv from "dotenv";

dotenv.config({
    path: resolve(process.cwd(), process.env.NODE_ENV === "production" ? "prod.env" : "local.env"),
});

export class ConfigService<T> {
    private readonly config: T;

    constructor({ config }: { config: T }) {
        this.config = config;
    }

    get<K>(path: string): K {
        return this.resolvePath(this.config, path) as K;
    }

    private resolvePath<K extends keyof T>(obj: T, path: string): T[K] {
        return (
            path
                .split(".")
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .reduce((currentValue: any, part: string) => currentValue[part], obj)
        );
    }
}
