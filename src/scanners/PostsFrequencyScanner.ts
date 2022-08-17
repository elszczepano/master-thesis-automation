import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';

export default class PostsFrequencyScanner extends Scanner {
    protected readonly _scannedElement: string = 'Posts frequency';

    public constructor() {
        super()
    }

    protected async _scan( { user, tweets }: IScannerParams ): Promise<IScannerOutput> {
        const postsFrequencyMap: Map<string, number> = new Map();
        let probablyPlannedPostsCount: number = 0;
        let lastActivityAt: Date = new Date( user.created_at );
        
        lastActivityAt = tweets.length ? new Date( tweets[ tweets.length - 1 ].created_at ) : lastActivityAt;

        tweets.map( tweet => {
            const tweetDay: string = tweet.created_at.split( 'T' )[ 0 ];
            const tweetDate: Date = new Date( tweet.created_at );
            const currentFrequency: number = postsFrequencyMap.get( tweetDay ) ?? 0;

            // Planner does not allow to set seconds and milliseconds for a scheduled tweet.
            if ( !tweetDate.getSeconds() && !tweetDate.getMilliseconds() ) {
                probablyPlannedPostsCount++;
            }

            postsFrequencyMap.set( tweetDay, currentFrequency + 1 );
        } );

        const frequencies: number[] = [ ...postsFrequencyMap.values() ];

        const maxTweetsPerDay: number = frequencies.length ? Math.max( ...frequencies ) : 0;
        const averageTweetsPerDay: number = frequencies.length ? Utils.getAverageValue( [ ...frequencies ] ): 0;

        const createdAt: Date = new Date( user.created_at );

        const profileLifetime: number = Utils.getDaysDiff( new Date(), createdAt );

        return {
            value: `
            <ul class="details__list">
                <li>Last activity at: <strong>${ lastActivityAt.toISOString() }</strong></li>
                <li>Average number of posts in active days: <strong>${ averageTweetsPerDay }</strong> (counts only days where at least one tweet was posted)</li>
                <li>Average number of posts overall: <strong>${ ( user.public_metrics.tweet_count / profileLifetime ).toFixed( 2 ) }</strong> (incl. inactive days)</li>
                <li>Number of inactive days in a given period: <strong>${ profileLifetime - [ ...postsFrequencyMap.keys() ].length }</strong></li>
                <li>Max posts in a single day: <strong>${ maxTweetsPerDay }</strong></li>
                <li>Probably planned posts count: <strong>${ probablyPlannedPostsCount } (${ ( ( probablyPlannedPostsCount / user.public_metrics.tweet_count ) * 100 ).toFixed( 2 ) }%)</strong></li>
            </ul>
            `,
            explanation: `
                Average number of posts in active days for real accounts usually does not exceed a few dozens.<br>
                If overage average value is significantly different from average value from active days it may be an indicate that an account
                have a large peaks of activity with a long idle time between.<br>
                Probably planned posts count is a percentage ratio of posts <strong>PROBABLY</strong> planned via the posts planner.
            `   
        };
    }
}