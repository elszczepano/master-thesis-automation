import { Request, Response } from 'express';

import ScannersFactory from '../scanners/ScannerFactory';
import { IScanner, IScannerReport } from '../scanners/Scanner';
import { IController } from './Controller';
import { IHttpClient, HttpResponse } from '../HttpClient';
import Utils from '../Utils';

interface IRequestBody {
    profile: string;
}

export default class ProfileReportController implements IController {
    public constructor(
        private readonly _scannersFactory: ScannersFactory,
        private readonly _httpClient: IHttpClient
    ) {}

    public async execute( request: Request, response: Response ): Promise<void> {
        const { profile }: IRequestBody = request.body;

        const exists: boolean = await this._checkProfileExistence( profile );

        if ( !exists ) {
            response.render( 'profile_not_found_view', { profile } );

            return;
        }

        const scanners: IScanner[] = this._scannersFactory.scanners;

        const results: IScannerReport[] = await Promise.all( scanners.map( scanner => scanner.scan( profile ) )  );

        response.render( 'profile_report_view', { profile, results } );
    }

    private async _checkProfileExistence( profile: string ): Promise<boolean> {
        const getUserDataResults: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/users/by/username/${ profile }`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const responseBody: Record<string, unknown> = await getUserDataResults.body.json();

        return !responseBody.errors;
    }
}