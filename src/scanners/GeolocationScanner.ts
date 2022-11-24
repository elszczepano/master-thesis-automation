import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';
import { IHttpClient, HttpResponse } from '../HttpClient';

const POSTS_LIMIT: number = 100;

interface ITweetData {
    geo?: {
        place_id: string;
    }
};

export default class GeolocationScanner extends Scanner {
    protected readonly _scannedElement: string = 'Geolocation';

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        const locations: string[] = [];

        const tweetsCopy = [ ...tweets ];

        const ids: string[] = tweetsCopy.slice( 0, POSTS_LIMIT ).map( tweet => tweet.id );

        const tweetsData: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/tweets?tweet.fields=geo&ids=${ ids.join() }`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const { data: updatedTweets, errors }: { data: ITweetData[]; errors?: Record<string, unknown>; } = await tweetsData.body.json();

        if ( errors ) {
            throw new Error( 'Fetching user geolocation failed' );
        }

        for ( const tweet of updatedTweets ) {
            if ( !tweet.geo ) {
                continue;
            }

            const geoData: HttpResponse = await this._httpClient.get(
                `https://api.twitter.com/1.1/geo/id/${ tweet.geo.place_id }.json`,
                { ...Utils.getTwitterAPIAuthHeaders() }
            );

            const { full_name } = await geoData.body.json();

            locations.push( full_name );
        }

        if ( !locations.length ) {
            return {
                value: 'No available locations for selected profile',
                explanation: 'Based on recent posts the latest geolocation is estimated'
            };
        }

        const uniqueLocations: string[] = [ ...new Set( locations ) ];

        let value = '<ul class="disc_list">';

        for ( const location of uniqueLocations ) {
            value += `<li>${ location },</li>`;
        }

        value += '</ul>';

        return {
            value,
            explanation: 'Based on recent posts the latest geolocation is estimated'
        };
    }

}