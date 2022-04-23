import { Request, Response } from 'express';

import { IController } from './Controller';

interface IRequestBody {
    profile: string;
}

export default class ProfileReportController implements IController {
    public async execute( request: Request, response: Response ): Promise<void> {
        const { profile }: IRequestBody = request.body;

        response.render( 'profile_report_view', { profile } );
    }
}