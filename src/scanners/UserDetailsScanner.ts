import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner, { IScannerOutput, IScannerParams } from './Scanner';
import Utils from '../Utils';



export default class UserDetailsScanner extends Scanner {
    protected readonly _scannedElement: string = 'User details';

    public constructor() {
        super()
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        const createdAt: Date = new Date( user.created_at );

        const profileLifetime: number = Utils.getDaysDiff( new Date(), createdAt );

        return {
            value: `
            <ul class="user_details__list">
                <li>Profile full name: <strong>${ user.name }</strong>.</li>
                <li>Profile created at: <strong>${ new Intl.DateTimeFormat( 'en-GB' ).format( createdAt ) }</strong>.</li>
                <li>Profile is live for <strong>${ profileLifetime }</strong> days.</li>
                <li>Description: <strong>${ user.description }</strong></li>
                <li>Followers count: <strong>${ user.public_metrics.followers_count }</strong></li>
                <li>Following count: <strong>${ user.public_metrics.following_count }</strong></li>
                <li>Tweets count: <strong>${ user.public_metrics.tweet_count }</strong></li>
                <li>Listed count: <strong>${ user.public_metrics.listed_count }</strong></li>
            </ul>
            `,
            explanation: 'Basic metrics from the scanned Twitter profile.'
        };
    }
}