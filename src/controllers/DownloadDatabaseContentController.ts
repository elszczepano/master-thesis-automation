import { Readable } from 'stream';

import { Request, Response } from 'express';

import { IController } from './Controller';
import ReportsModel, { IReport } from '../models/ReportsModel';

export default class DownloadReportController implements IController {
    public constructor( private readonly _reportsModel: ReportsModel ) { }

    public async execute( request: Request, response: Response ): Promise<void> {
        const content: IReport[] = await this._reportsModel.getDatabaseContent();

        if ( !content.length ) {
            response.status( 404 ).end();
        }

        const disposition = 'attachment; filename="database.json"';
        response.setHeader( 'Content-type', 'application/json' );
        response.setHeader( 'Content-Disposition', disposition );


        const readable: Readable = Readable.from( JSON.stringify( content ), { encoding: 'utf8' } );

        readable.pipe( response );
    }
}