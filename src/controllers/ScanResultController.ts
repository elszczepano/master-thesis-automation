import { Request, Response } from 'express';

import ScannersFactory from '../scanners/ScannerFactory';
import { IScanner, IScannerReport } from '../scanners/Scanner';
import { IController } from './Controller';
import { IHttpClient, HttpResponse } from '../HttpClient';
import Utils from '../Utils';

interface IRequestBody {
    profile: string;
    startDate: string;
    endDate: string;
}

export default class ScanResultController implements IController {
    public constructor(
        private readonly _scannersFactory: ScannersFactory,
        private readonly _httpClient: IHttpClient
    ) {}

    public async execute( request: Request, response: Response ): Promise<void> {
        const { profile, startDate: start, endDate: end }: IRequestBody = request.body;

        const startDate: Date | undefined = start ? new Date( start ) : undefined;
        const endDate: Date | undefined = end ? new Date( end ) : undefined;

        if ( !this._isValidTimeRange( startDate, endDate ) ) {
            response.render( 'profile_not_found_view', { profile, reason: 'Invalid time range.' } );

            return;
        }

        const exists: boolean = await this._checkProfileExistence( profile );

        if ( !exists ) {
            response.render( 'profile_not_found_view', { profile, reason: 'Profile not found.' } );

            return;
        }

        const scanners: IScanner[] = this._scannersFactory.scanners;

        const results: IScannerReport[] = await Promise.all( scanners.map( scanner => scanner.scan( { profile, startDate, endDate } ) ) );

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

    private _isValidTimeRange( startDate?: Date, endDate?: Date ): boolean {
        const now: Date = new Date();

        if ( startDate && startDate > now ) {
            return false;
        }

        if ( startDate && endDate && startDate > endDate ) {
            return false;
        }

        return true;
    }
}