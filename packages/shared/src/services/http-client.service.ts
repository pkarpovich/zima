import axios, { type AxiosInstance, type AxiosResponse, type AxiosRequestConfig } from "axios";

export type RequestOptions = AxiosRequestConfig;

export class HttpClientService {
    private _client: AxiosInstance;

    constructor() {
        this._client = axios.create();
    }

    get(url: string, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.get(url, options);
    }

    post(url: string, data?: unknown, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.post(url, data, options);
    }

    put(url: string, data?: unknown, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.put(url, data, options);
    }

    delete(url: string, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.delete(url, options);
    }
}
