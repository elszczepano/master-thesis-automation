import { Request, Response } from 'express';

import { IController } from './Controller';
import ReportsModel from '../models/ReportsModel';

export default class RootController implements IController {
    public constructor(
        private readonly _reportsModel: ReportsModel
    ) { }

    public async execute( request: Request, response: Response ): Promise<void> {
        const datasets: string[] = await this._reportsModel.getDatasets();

        response.render( 'root_view', { datasets } );
    }
}