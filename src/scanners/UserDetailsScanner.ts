import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner, { IScannerOutput, IScannerParams } from './Scanner';
import Utils from '../Utils';

interface IGetUserDataResults {
    data: {
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
}

export default class UserDetailsScanner extends Scanner {
    protected readonly _scannedElement: string = 'User details';

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( { profile }: IScannerParams ): Promise<IScannerOutput> {
        const getUserDataResults: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/users/by/username/${ profile }?user.fields=created_at,description,name,public_metrics`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const { data } = await getUserDataResults.body.json() as IGetUserDataResults;

        const createdAt: Date = new Date( data.created_at );

        const profileLifetime: number = Utils.getDaysDiff( new Date(), createdAt );

        return {
            value: `
            <ul class="user_details__list">
                <li>Profile full name: <strong>${ data.name }</strong>.</li>
                <li>Profile created at: <strong>${ new Intl.DateTimeFormat( 'en-GB' ).format( createdAt ) }</strong>.</li>
                <li>Profile is live for <strong>${ profileLifetime }</strong> days.</li>
                <li>Description: <strong>${ data.description }</strong></li>
                <li>Followers count: <strong>${ data.public_metrics.followers_count }</strong></li>
                <li>Following count: <strong>${ data.public_metrics.following_count }</strong></li>
                <li>Tweets count: <strong>${ data.public_metrics.tweet_count }</strong></li>
                <li>Listed count: <strong>${ data.public_metrics.listed_count }</strong></li>
            </ul>
            `,
            explanation: 'Basic metrics from the scanned Twitter profile.'
        };
    }
}