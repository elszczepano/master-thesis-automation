import { Request, Response } from 'express';

import { IController } from './Controller';

export default class RootController implements IController {
    public async execute( request: Request, response: Response ): Promise<void> {
        response.render( 'root_view' );
    }
}