import { Readable } from 'stream';

import { Request, Response } from 'express';

import { IController } from './Controller';
import ReportsModel, { IReport } from '../models/ReportsModel';

interface IRequestParams {
    username: string;
}

export default class DownloadReportController implements IController {
    public constructor( private readonly _reportsModel: ReportsModel ) { }

    public async execute( request: Request<IRequestParams>, response: Response ): Promise<void> {
        const { username }: IRequestParams = request.params;

        const report: IReport | null = await this._reportsModel.findByUsername( username );

        if ( !report ) {
            response.status( 404 ).end();
        }

        const disposition = `attachment; filename="${ username }.json"`;
        response.setHeader( 'Content-type', 'application/json' );
        response.setHeader( 'Content-Disposition', disposition );
    
        
        const readable: Readable = Readable.from( JSON.stringify( report ), { encoding: 'utf8' } );

        readable.pipe( response );
    }
}