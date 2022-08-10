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

export interface IGetUserDataResults {
    data: IUser;
    errors?: Record<string, unknown>;
}

export interface IUser {
    description: string;
    name: string;
    username: string;
    profile_image_url: string;
    id: string;
    public_metrics: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
        listed_count: number;
    };
    created_at: string;
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

        const { errors, data } = await this._getUserProfile( profile );

        if ( errors ) {
            response.render( 'profile_not_found_view', { profile, reason: 'Profile not found.' } );

            return;
        }

        const scanners: IScanner[] = this._scannersFactory.scanners;

        const results: IScannerReport[] = await Promise.all(
            scanners.map( scanner => scanner.scan( { profile, startDate, endDate, user: data } ) )
        );

        response.render( 'profile_report_view', { profile, results } );
    }

    private async _getUserProfile( profile: string ): Promise<IGetUserDataResults> {
        const getUserDataResults: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/users/by/username/${ profile }?user.fields=created_at,description,name,public_metrics,profile_image_url`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const { data, errors }: IGetUserDataResults = await getUserDataResults.body.json();

        return { data, errors };
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