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
                <li>Profile full name: <strong>${ user.name }</strong></li>
                <li>Profile created at: <strong>${ new Intl.DateTimeFormat( 'en-GB' ).format( createdAt ) }</strong></li>
                <li>Profile is live for <strong>${ profileLifetime }</strong> days</li>
                <li>Description: <strong>${ user.description }</strong></li>
                <li>Followers count: <strong>${ user.public_metrics.followers_count }</strong></li>
                <li>Following count: <strong>${ user.public_metrics.following_count }</strong></li>
                <li>Tweets count: <strong>${ user.public_metrics.tweet_count }</strong></li>
                <li>Is profile verified ${ VERIFIED_BADGE_SVG }: <strong>${ user.verified.toString().toUpperCase() }</strong></li>
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

const VERIFIED_BADGE_SVG: string = '<svg viewBox="0 0 24 24" aria-label="Verified account" role="img" class="verified_badge"><g><path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"></path></g></svg>'