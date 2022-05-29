import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner from './Scanner';
import Utils from '../Utils';

const MAX_RESULTS_PER_PAGE: number = 50;

interface ITweet {
    id: string;
    text: string;
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
        
        while ( paginationToken !== undefined ) {
            const getUserTweetsResults: HttpResponse = await this._httpClient.get(
                this._getUserTweetsAPIUrl( data.id, paginationToken ),
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { meta } = await getUserTweetsResults.body.json() as IGetUserTweetsResults;

            paginationToken = meta.next_token;
        } 

        // TODO replace with statistics
        return `
            <ul class="details__list">
                 <li>key: value</li>
            </ul>
        `;
    }

    private _getUserTweetsAPIUrl( id: string, paginationToken?: string ): string {
        return paginationToken ? 
            `https://api.twitter.com/2/users/${ id }/tweets?max_results=${ MAX_RESULTS_PER_PAGE }&pagination_token=${ paginationToken }` :
            `https://api.twitter.com/2/users/${ id }/tweets?max_results=${ MAX_RESULTS_PER_PAGE }`;
    }
}