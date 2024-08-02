import axios, { type AxiosInstance, type AxiosResponse, type AxiosRequestConfig, isAxiosError } from "axios";

export type RequestOptions = AxiosRequestConfig;

export const isHttpError = isAxiosError;

export class HttpClientService {
    private _client: AxiosInstance;

    constructor() {
        this._client = axios.create();
    }

    get(url: string, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.get(url, options);
    }

    post<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<AxiosResponse<T>> {
        return this._client.post<T>(url, data, options);
    }

    put(url: string, data?: unknown, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.put(url, data, options);
    }

    delete(url: string, options?: RequestOptions): Promise<AxiosResponse> {
        return this._client.delete(url, options);
    }
}
