import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import { IHttpClient, HttpResponse } from '../HttpClient';
import ReportsModel from '../models/ReportsModel';
import Utils from '../Utils';

interface IUser {
    id: string;
    name: string;
    username: string;
}

interface IGetUsersResult {
    data: IUser[];
    meta: {
        next_token?: string;
        result_count: number;
    }
}

export default class MutualConnectionsScanner extends Scanner {
    protected readonly _scannedElement: string = 'Mutual connections';

    public constructor(
        private readonly _httpClient: IHttpClient,
        private readonly _reportsModel: ReportsModel
    ) {
        super()
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        const [ followers, following ] = await Promise.all( [
            this._getFollowers( user.id ),
            this._getFollowing( user.id )
        ] );

        const profiles: string[] = await this._reportsModel.getScannedProfileNames();

        const commonFollowers: string[] = this._getCommonUsernames( profiles, followers );
        const commonFollowings: string[] = this._getCommonUsernames( profiles, following );

        return {
            value: `
                <p>
                    Already scanned followers: <strong>(${ commonFollowers.join( ', ' ) })</strong>.
                    Count: <strong>${ commonFollowers.length }</strong>
                </p>
                <p>
                    Already scanned followings: <strong>(${ commonFollowings.join( ', ' ) })</strong>.
                    Count: <strong>${ commonFollowings.length }</strong>
                </p>
            `,
            explanation: `
                <p>
                    The metric shows the list and count of accounts that follows or are followed
                    by the scanned profile and have been already scanned in the application.

                    The metric may help to detect a net of mutual connections between profiles.
                </p>
            `,
            dataToSave: {
                following: following.map( user => user.username ),
                followers: followers.map( user => user.username )
            }
        };
    }

    private async _getFollowers( userId: string ): Promise<IUser[]> {
        return this._getUsersList( userId, 'followers' );
    }

    private async _getFollowing( userId: string ): Promise<IUser[]> {
        return this._getUsersList( userId, 'following' );
    }

    private async _getUsersList( userId: string, type: 'followers' | 'following' ): Promise<IUser[]> {
        let userList: IUser[] = [];

        let paginationToken: string | undefined = '';

        while ( paginationToken !== undefined ) {
            const getUsersResults: HttpResponse = await this._httpClient.get(
                `https://api.twitter.com/2/users/${ userId }/${ type }?max_results=1000`,
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { meta, data: users } = await getUsersResults.body.json() as IGetUsersResult;

            if ( !users?.length ) {
                // Handle a situation when e.g. a rate limit is reached or the list is empty.
                break;
            }

            userList = [ ...userList, ...users ];

            paginationToken = meta.next_token;
        }

        return userList;
    }

    private _getCommonUsernames( savedProfiles: string[], apiResult: IUser[] ): string[] {
        const apiResultUsernames: string[] = apiResult.map( user => user.username );

        const commonUsernames = [];

        for ( const savedProfile of savedProfiles ) {
            if ( apiResultUsernames.includes( savedProfile ) ) {
                commonUsernames.push( savedProfile );
            }
        }

        return commonUsernames;
    }
}