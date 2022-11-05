import { IncomingHttpHeaders } from 'http';

import dotenv from 'dotenv';

dotenv.config();

const DAY_LENGTH: number = 1000 * 60 * 60 * 24;
const MAX_RESULTS_PER_PAGE: number = 50;

export default class Utils {
    public static wait( ms: number ): Promise<void> {
        return new Promise( ( resolve: () => void ) => setTimeout( resolve, ms ) );
    }

    public static getTwitterAPIAuthHeaders(): IncomingHttpHeaders {
        return {
            'Authorization': `Bearer ${ process.env.BEARER_TOKEN }`
        }
    }

    public static getV7LabsAPIKey(): string {
        return `ApiKey ${ process.env.V7_LABS_API_KEY }`;
    }

    public static getAverageValue( numbers: number[] ): number {
        return Math.round( numbers.reduce( ( a, b ) => a + b ) / numbers.length );
    }

    public static getDaysDiff( date1: Date, date2: Date ): number {
        const diffTime: number = Math.abs( date2.getTime() - date1.getTime() );

        return Math.ceil( diffTime / ( DAY_LENGTH ) );
    }

    public static getUserTweetsAPIUrl(
        id: string,
        paginationToken?: string,
        timeRange: { startDate?: Date; endDate?: Date; } = {}
    ): string {
        let queryParams: string = `?max_results=${ MAX_RESULTS_PER_PAGE }&tweet.fields=created_at`;

        if ( paginationToken ) {
            queryParams = `${ queryParams }&pagination_token=${ paginationToken }`;
        }

        if ( timeRange.startDate ) {
            queryParams = `${ queryParams }&start_time=${ timeRange.startDate.toISOString() }`;
        }

        if ( timeRange.endDate ) {
            queryParams = `${ queryParams }&end_time=${ timeRange.endDate.toISOString() }`;
        }

        return `https://api.twitter.com/2/users/${ id }/tweets${ queryParams }`;
    }

    public static getUserFollowersAPIUrl(
        id: string,
        type: 'followers' | 'following',
        paginationToken?: string
    ): string {
        let queryParams: string = `?max_results=1000`;

        if ( paginationToken ) {
            queryParams = `${ queryParams }&pagination_token=${ paginationToken }`;
        }

        return `https://api.twitter.com/2/users/${ id }/${ type }${ queryParams }`;
    }

    public static sortByFrequency( frequencies: Record<string, number> ): Record<string, number> {
        return Object.entries( frequencies )
            .sort( ( [ , a ], [ , b ] ) => b - a )
            .reduce( ( r, [ k, v ] ) => ( { ...r, [ k ]: v } ), {} );
    }

    public static countFrequency( strings: string[] ): Record<string, number> {
        return strings.reduce(
            ( acc: Record<string, number>, curr: string ) => {
                acc[ curr ] = -~acc[ curr ];
                return acc;
            },
            {}
        );
    }
}