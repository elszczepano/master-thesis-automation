import path from 'path';

import express, { Express } from 'express';

import Router from './Router';

export default class Service {
    private readonly _service: Express;

    public constructor( port: number ) {
        this._service = express();

        this._service.set( 'views', path.join( __dirname, 'views' ) );
        this._service.set( 'view engine', 'pug' );
        this._service.use( express.static( path.join( __dirname, 'assets' ) ) );

        this._service.listen( port, () => {
            console.log( `Server is working on ${ port } port...` )
        } );
    }

    public addRouter( path: string, router: Router ) {
        this._service.use( path, router.getInstance() );
    }
}