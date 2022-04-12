import express, { Express } from 'express';

import Router from './Router';

export default class Service {
    private readonly _service: Express;

    public constructor( port: number ) {
        this._service = express();

        this._service.listen( port, () => {
            console.log( `Server is working on ${ port } port...` )
        } );
    }

    public addRouter( path: string, router: Router ) {
        this._service.use( path, router.getInstance() );
    }
}