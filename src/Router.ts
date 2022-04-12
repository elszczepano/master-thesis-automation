import { Router as ExpressRouter } from 'express';
import path from 'path';

import { IController } from './controllers/Controller';

interface IRouteDefinition {
    method: 'get' | 'post' | 'put' | 'delete';
    path: string;
    controller: IController;
}

export default class Router {
    private readonly _router: ExpressRouter;

    public constructor(
        routes: IRouteDefinition[] = []
    ) {
        this._router = ExpressRouter();

        for ( const { method, path, controller } of routes ) {
            this._router[ method ]( path, controller.execute );
        }
    }

    getInstance(): ExpressRouter {
        return this._router;
    }

}