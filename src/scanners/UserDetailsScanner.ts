import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import ReportsModel, { IReportsStatistics } from '../models/ReportsModel';
import Utils from '../Utils';

export default class UserDetailsScanner extends Scanner {
    protected readonly _scannedElement: string = 'User details';

    public constructor( private readonly _reportsModel: ReportsModel ) {
        super()
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        const createdAt: Date = new Date( user.created_at );

        const profileLifetime: number = Utils.getDaysDiff( new Date(), createdAt );

        const { followersCount, followingCount, tweetsCount }: IReportsStatistics = await this._reportsModel.getStatistics();

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
            </ul>
            `,
            explanation: `
                <p>Basic metrics from the scanned Twitter profile.<p>
                <p>Statistics for already scanned profiles:</p>
                <ul class="user_details__list">
                    <li>Average followers count: <strong>${ Math.round( followersCount ) }</strong></li>
                    <li>Average following count: <strong>${ Math.round( followingCount ) }</strong></li>
                    <li>Average tweets count: <strong>${  Math.round( tweetsCount ) }</strong></li>
                </ul>
            `,
            dataToSave: {
                tweetsCount: user.public_metrics.tweet_count,
                followersCount: user.public_metrics.followers_count,
                followingCount: user.public_metrics.following_count
            }
        };
    }
}