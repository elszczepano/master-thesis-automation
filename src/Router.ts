import { Router as ExpressRouter } from 'express';
import bodyParser from 'body-parser';

import { IController } from './controllers/Controller';

interface IRouteDefinition {
    method: 'get' | 'post' | 'put' | 'delete';
    path: string;
    controller: IController;
}

export default class Router {
    private readonly _router: ExpressRouter;

    public constructor( routes: IRouteDefinition[] = [] ) {
        this._router = ExpressRouter();

        for ( const { method, path, controller } of routes ) {
            if ( [ 'put', 'post' ].includes( method ) ) {
                this._router[ method ](
                    path,
                    bodyParser.urlencoded( { extended: false } ),
                    controller.execute.bind( controller )
                );

                continue;
            }

            this._router[ method ]( path, controller.execute.bind( controller ) );
        }
    }

    getInstance(): ExpressRouter {
        return this._router;
    }

}