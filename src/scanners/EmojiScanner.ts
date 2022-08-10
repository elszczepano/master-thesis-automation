import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner, { IScannerOutput, IScannerParams } from './Scanner';
import Utils from '../Utils';

const EMOJIS_FREQUENCY_LIMIT: number = 20;

interface ITweet {
    id: string;
    text: string;
    created_at: string;
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

export default class EmojiScanner extends Scanner {
    protected readonly _scannedElement: string = 'Most used emojis';

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( { startDate, endDate, user }: IScannerParams ): Promise<IScannerOutput> {
        let paginationToken: string | undefined = '';

        let emojis: string[] = [];

        while ( paginationToken !== undefined ) {
            const getUserTweetsResults: HttpResponse = await this._httpClient.get(
                Utils.getUserTweetsAPIUrl( user.id, paginationToken, { startDate, endDate } ),
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { meta, data: tweets } = await getUserTweetsResults.body.json() as IGetUserTweetsResults;

            if ( !tweets?.length ) {
                // Handle a situation when e.g. a rate limit is reached or the profile is empty.
                break;
            }

            tweets.map( tweet => {
                let currentTweetEmojis: string[] = tweet.text.match( /\p{Emoji}+/gu ) ?? []

                // Trim numbers and special characters. See: https://unicode.org/Public/emoji/11.0/emoji-data.txt
                // TL;DR; numbers and special chars are emojis
                currentTweetEmojis = currentTweetEmojis.filter( emoji => Number.isNaN( Number( emoji ) ) );
                currentTweetEmojis = currentTweetEmojis.filter(
                    emoji => ![ '*', '#', '▶', '‼', '▪' ].some( char => emoji.trim().includes( char ) )
                );

                emojis = [ ...emojis, ...currentTweetEmojis ];
            } );

            paginationToken = meta.next_token;
        }

        const emojisFrequency: Record<string, number> = this._sortByFrequency( this._countEmojiFrequency( emojis ) );

        if ( !Object.keys( emojisFrequency ).length ) {
            return {
                value: 'N/A',
                explanation: 'The scanned profile does not use emojis.'
            }
        }

        let value = '<p>Most frequent emojis:</p><ul class="emojis_frequency">';

        // Get only the most frequently used emojis
        for ( const [ emoji, frequency ] of Object.entries( emojisFrequency ).slice( 0, EMOJIS_FREQUENCY_LIMIT ) ) {
            value += `<li>${ emoji } (${ frequency } occurrences)</li>`;
        }

        value = value + '</ul>';

        return {
            value,
            explanation: `Returns used emojis with the number of occurrences in an descending order (up to ${ EMOJIS_FREQUENCY_LIMIT } most frequent emojis).`
        };
    }

    private _countEmojiFrequency( emojis: string[] ): Record<string, number> {
        return emojis.reduce(
            ( acc: Record<string,number>, curr: string ) => {
                acc[ curr ] = -~acc[ curr ];
                return acc;
            },
            {}
        );
    }

    private _sortByFrequency( emojisFrequency: Record<string, number> ): Record<string, number> {
        return Object.entries( emojisFrequency )
            .sort( ( [ , a ], [ , b ] ) => b - a )
            .reduce( ( r, [ k, v ] ) => ( { ...r, [ k ]: v } ), {} );
    }
}