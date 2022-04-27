import { IncomingHttpHeaders } from 'http';
import { Readable } from 'stream';

import { request, Dispatcher } from 'undici';

interface IHttpClientConfig {
    baseUrl: string;
}

type HttpBody = string | Buffer | Uint8Array | Readable | null | undefined;
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type HttpResponse = Dispatcher.ResponseData;

export interface IHttpClient {
    get( url: string, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData>;
    post( url: string, body?: HttpBody, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData>;
    put( url: string, body?: HttpBody, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData>;
    delete( url: string, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData>;
    patch( url: string, body?: HttpBody, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData>;
}

export default class HttpClient implements IHttpClient {
    public constructor(
        private readonly _config: Partial<IHttpClientConfig> = {},
        private readonly _requestFunction: typeof request = request
    ) { }

    public get( url: string, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData> {
        return this._sendRequest( 'GET', url, headers );
    }

    public post( url: string, body?: HttpBody, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData> {
        return this._sendRequest( 'POST', url, headers, body );
    }

    public put( url: string, body?: HttpBody, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData> {
        return this._sendRequest( 'PUT', url, headers, body );
    }

    public delete( url: string, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData> {
        return this._sendRequest( 'DELETE', url, headers );
    }

    public patch( url: string, body?: HttpBody, headers?: Partial<IncomingHttpHeaders> ): Promise<Dispatcher.ResponseData> {
        return this._sendRequest( 'PATCH', url, headers, body );
    }

    private _sendRequest(
        method: Method,
        url: string,
        headers: Partial<IncomingHttpHeaders> = {},
        body: HttpBody = null
    ): Promise<Dispatcher.ResponseData> {
        return this._requestFunction( url, { ...this._config, method, headers, body } );
    }
}