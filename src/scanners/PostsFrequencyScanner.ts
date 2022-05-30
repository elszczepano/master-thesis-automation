import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner from './Scanner';
import Utils from '../Utils';

const MAX_RESULTS_PER_PAGE: number = 50;

interface ITweet {
    id: string;
    text: string;
    created_at: string;
}

interface IGetUserDataResults {
    data: {
        description: string;
        username: string;
        id: string;
    }
}

interface IGetUserTweetsResults {
    data: ITweet[];
    meta: {
        next_token?: string;
        result_count: number;
        newest_id: string;
        oldest_id: string;
    }
}

export default class PostsFrequencyScanner extends Scanner {
    protected readonly _scannedElement: string = 'Posts frequency';

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( profile: string ): Promise<string> {
        const getUserDataResults: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/users/by/username/${ profile }`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const { data } = await getUserDataResults.body.json() as IGetUserDataResults;

        let paginationToken: string | undefined = '';
        const postsFrequencyMap: Map<string,number> = new Map();
        
        while ( paginationToken !== undefined ) {
            const getUserTweetsResults: HttpResponse = await this._httpClient.get(
                this._getUserTweetsAPIUrl( data.id, paginationToken ),
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { meta, data: tweets } = await getUserTweetsResults.body.json() as IGetUserTweetsResults;

            if ( !tweets?.length ) {
                // Handle a situation when e.g. a rate limit is reached or the profile is empty.
                break;
            }

            tweets.map( tweet => {
                const tweetDate: string = tweet.created_at.split('T')[ 0 ];
                const currentFrequency: number = postsFrequencyMap.get( tweetDate ) ?? 0;

                postsFrequencyMap.set( tweetDate, currentFrequency + 1 );
            } );

            paginationToken = meta.next_token;
        }

        const frequencies: number[] = [ ...postsFrequencyMap.values() ];

        const maxTweetsPerDay: number = frequencies.length ? Math.max( ...frequencies ) : 0;
        const averageTweetsPerDay: number = frequencies.length ? Utils.getAverageValue( [ ...frequencies ] ): 0;

        return `
            <ul class="details__list">
                <li>Average number of posts in a single day: <strong>${ averageTweetsPerDay }</strong> (counts only days where at least one tweet was posted)</li>
                <li>Max posts in a single day: <strong>${ maxTweetsPerDay }</strong></li>
            </ul>
        `;
    }

    private _getUserTweetsAPIUrl( id: string, paginationToken?: string ): string {
        let queryParams: string = `?max_results=${ MAX_RESULTS_PER_PAGE }&tweet.fields=created_at`;

        if ( paginationToken ) {
            queryParams = `${ queryParams }&pagination_token=${ paginationToken }`;
        }

        return `https://api.twitter.com/2/users/${ id }/tweets${ queryParams }`;
    }
}