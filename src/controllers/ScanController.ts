import { Request, Response } from 'express';

import ScannersFactory from '../scanners/base/ScannerFactory';
import { IScannerReport } from '../scanners/base/Scanner';
import { IController } from './Controller';
import { IHttpClient, HttpResponse } from '../HttpClient';
import Utils from '../Utils';
import ReportsModel, { IReport } from '../models/ReportsModel';

interface IRequestBody {
    profile: string;
    startDate?: string;
    endDate?: string;
    dataset?: string;
}

interface IGetUserDataResult {
    user: IUser;
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
    verified: boolean;
}

export interface ITweet {
    id: string;
    text: string;
    created_at: string;
}

interface IGetUserTweetsResult {
    data: ITweet[];
    meta: {
        next_token?: string;
        result_count: number;
        newest_id: string;
        oldest_id: string;
    }
}

interface IFollower {
    id: string;
    name: string;
    username: string;
}

interface IGetIFollowerResult {
    data: IFollower[];
    meta: {
        next_token?: string;
        result_count: number;
    }
}

export default class ScanController implements IController {
    public constructor(
        private readonly _scannersFactory: ScannersFactory,
        private readonly _httpClient: IHttpClient,
        private readonly _reportsModel: ReportsModel
    ) {}

    public async execute( request: Request, response: Response ): Promise<void> {
        const { profile, startDate: start, endDate: end }: IRequestBody = request.body;
        const dataset: string = request.body.dataset ? request.body.dataset : 'dataset';

        const startDate: Date | undefined = start ? new Date( start ) : undefined;
        const endDate: Date | undefined = end ? new Date( end ) : undefined;

        const datasets: string[] = await this._reportsModel.getDatasets();

        if ( !datasets.includes( dataset ) ) {
            datasets.push( dataset );
        }

        if ( !this._isValidTimeRange( startDate, endDate ) ) {
            response.render( 'action_failed', { profile, datasets, reason: 'Invalid time range.' } );

            return;
        }

        const { errors, user } = await this._getUserProfile( profile );

        if ( errors ) {
            response.render( 'action_failed', { profile, datasets, reason: 'Profile not found.' } );

            return;
        }

        const tweets: ITweet[] = await this._getUserTweets( { startDate, endDate, user } );

        const results: IScannerReport[] = await Promise.all(
            this._scannersFactory.scanners.map( scanner => scanner.scan( { startDate, endDate, user, tweets } ) )
        );

        const dataToSave: Partial<IReport> = results.reduce( ( prev, curr ) => {
            return { ...prev, ...curr.dataToSave ?? {} };
        }, {} );

        const [ followers, following ] = await Promise.all( [
            this._getFollowers( user ),
            this._getFollowing( user )
        ] );

        await this._reportsModel.save( 
            user.username,
            {
                tweets,
                lastScanAt: new Date(),
                followers: followers.map( f => f.username ),
                following: following.map( f => f.username ),
                dataset,
                ...dataToSave
            }
        );

        const documentsCount: number = await this._reportsModel.count();

        response.render( 'profile_report_view', { profile, results, documentsCount, datasets, dataset } );
    }

    private async _getFollowers( user: IUser ): Promise<IFollower[]> {
        return this._getUsersList( { user, type: 'followers' } );
    }

    private async _getFollowing( user: IUser ): Promise<IFollower[]> {
        return this._getUsersList( { user, type: 'following' } );
    }

    private async _getUserProfile( profile: string ): Promise<IGetUserDataResult> {
        const getUserDataResults: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/users/by/username/${ profile }?user.fields=verified,created_at,description,name,public_metrics,profile_image_url`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const { data: user, errors }: { data: IUser; errors?: Record<string, unknown>; } = await getUserDataResults.body.json();

        return { user, errors };
    }

    private _isValidTimeRange( startDate?: Date, endDate?: Date ): boolean {
        const now: Date = new Date();

        if ( startDate && startDate > now ) {
            return false;
        }

        if ( endDate && endDate > now ) {
            return false;
        }

        if ( startDate && endDate && startDate > endDate ) {
            return false;
        }

        return true;
    }

    private async _getUserTweets( params: { startDate?: Date, endDate?: Date, user: IUser } ): Promise<ITweet[]> {
        const { startDate, endDate, user } = params;

        let userTweets: ITweet[] = [];

        let paginationToken: string | undefined = '';

        while ( paginationToken !== undefined ) {
            const getUserTweetsResults: HttpResponse = await this._httpClient.get(
                Utils.getUserTweetsAPIUrl( user.id, paginationToken, { startDate, endDate } ),
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { meta, data: tweets } = await getUserTweetsResults.body.json() as IGetUserTweetsResult;

            if ( !tweets?.length ) {
                // Handle a situation when e.g. a rate limit is reached or the profile is empty.
                break;
            }

            userTweets = [ ...userTweets, ...tweets ];

            paginationToken = meta.next_token;
        }

        return userTweets;
    }

    private async _getUsersList( params: { type: 'followers' | 'following', user: IUser } ): Promise<IFollower[]> {
        let userList: IFollower[] = [];

        let paginationToken: string | undefined = '';

        while ( paginationToken !== undefined ) {
            const getUsersResults: HttpResponse = await this._httpClient.get(
                Utils.getUserFollowersAPIUrl( params.user.id, params.type, paginationToken ),
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { meta, data: users } = await getUsersResults.body.json() as IGetIFollowerResult;

            if ( !users?.length ) {
                // Handle a situation when e.g. a rate limit is reached or the list is empty.
                break;
            }

            userList = [ ...userList, ...users ];

            paginationToken = meta.next_token;
        }

        return userList;
    }
}

