import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';
import { IHttpClient, HttpResponse } from '../HttpClient';
import { IUser } from '../controllers/ScanController';

const MENTIONS_FREQUENCY_LIMIT: number = 20;

interface ITweetData {
    author_id: string;
};

interface IGetUserTweetsResult {
    data: ITweetData[];
    meta: {
        next_token?: string;
        result_count: number;
        newest_id: string;
        oldest_id: string;
    }
}

export default class MentionsAndLikesScanner extends Scanner {
    protected readonly _scannedElement: string = 'Most mentioned and liked accounts';

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( { tweets, user, startDate, endDate }: IScannerParams ): Promise<IScannerOutput> {
        let mentions: string[] = [];

        tweets.map( tweet => {
            let currentTweetMentions: string[] = tweet.text.split( ' ' ).filter( word => word.startsWith( '@' ) );

            mentions = [ ...mentions, ...currentTweetMentions ];
        } );

        const mentionsFrequency: [ string, number ][] = Utils.sortByFrequency( mentions );

        let mentionsReportResults = '<p>The scanned profile does not use mentions</p>';

        if ( mentionsFrequency.length ) {
            mentionsReportResults = '<p>Most frequent mentions:</p><ul class="mentions_frequency">';
 
            // Get only the most frequently used mentions
            for ( const [ mention, frequency ] of mentionsFrequency.slice( 0, MENTIONS_FREQUENCY_LIMIT ) ) {
                mentionsReportResults += `<li><a href="https://twitter.com/${ mention }" target="_blank"><strong>${ mention }</strong></a> (${ frequency } ${ frequency == 1 ? 'occurrence' : 'occurrences' })</li>`;
            }

            mentionsReportResults = mentionsReportResults + '</ul>';
        }

        const likedTweets: ITweetData[] = await this._getUserTweets( { startDate, endDate, user } );

        const authors: string[] = [ ...likedTweets.map( tweet => tweet.author_id ) ];

        const likesFrequency: [ string, number ][] = Utils.sortByFrequency( authors );

        let likesReportResults = '<br><p>The scanned profile does not use likes</p>';

        if ( likesFrequency.length ) {
            likesReportResults = '<br><p>Most liked profiles:</p><ul class="mentions_frequency">';

            // Get only the most frequently used mentions
            for ( const [ author, frequency ] of likesFrequency.slice( 0, MENTIONS_FREQUENCY_LIMIT ) ) {
                const getUserDataResults: HttpResponse = await this._httpClient.get(
                    `https://api.twitter.com/2/users/${ author }?user.fields=username`,
                    { ...Utils.getTwitterAPIAuthHeaders() }
                );

                const { data: user }: { data: IUser; } = await getUserDataResults.body.json();

                likesReportResults += `<li><a href="https://twitter.com/${ user.username }" target="_blank"><strong>${ user.username }</strong></a> (${ frequency } ${ frequency == 1 ? 'occurrence' : 'occurrences' })</li>`;
            }

            likesReportResults = likesReportResults + '</ul>';
        }

        return {
            value: mentionsReportResults + likesReportResults,
            explanation: `Returns used mentions and liked accounts with the number of occurrences in an descending order (up to ${ MENTIONS_FREQUENCY_LIMIT } most frequent mentions).`
        };
    }


    private async _getUserTweets( params: { startDate?: Date, endDate?: Date, user: IUser } ): Promise<ITweetData[]> {
        const { startDate, endDate, user } = params;

        let userTweets: ITweetData[] = [];

        let paginationToken: string | undefined = '';

        while ( paginationToken !== undefined ) {
            const getUserTweetsResults: HttpResponse = await this._httpClient.get(
                Utils.getUserTweetLikesAPIUrl( user.id, paginationToken, { startDate, endDate } ),
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
}