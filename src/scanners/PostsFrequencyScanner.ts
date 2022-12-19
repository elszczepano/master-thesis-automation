import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import ReportsModel, { IReportsStatistics } from '../models/ReportsModel';
import Utils from '../Utils';
import { SUSPICIOUS_CONTENT_CLASS } from '../constants';

const SUSPICIOUS_PLANNED_POSTS_RATIO: number = 0.5;

export default class PostsFrequencyScanner extends Scanner {
    protected readonly _scannedElement: string = 'Posts frequency';

    public constructor( private readonly _reportsModel: ReportsModel ) {
        super()
    }

    protected async _scan( { user, tweets }: IScannerParams ): Promise<IScannerOutput> {
        let probablyPlannedPostsCount: number = 0;
        const sources: Record<string,number> = {};

        const postsFrequencyMap: Map<string, number> = new Map();
        const lastActivityAt: Date = tweets.length ? new Date( tweets[ 0 ].created_at ) : new Date( user.created_at );

        tweets.map( tweet => {
            const tweetDay: string = tweet.created_at.split( 'T' )[ 0 ];
            const tweetDate: Date = new Date( tweet.created_at );
            const currentFrequency: number = postsFrequencyMap.get( tweetDay ) ?? 0;

            // Planner does not allow to set seconds and milliseconds for a scheduled tweet.
            if ( !tweetDate.getSeconds() && !tweetDate.getMilliseconds() ) {
                probablyPlannedPostsCount++;
            }

            sources[ tweet.source ] = sources[ tweet.source ] ? sources[ tweet.source ] + 1 : 1;

            postsFrequencyMap.set( tweetDay, currentFrequency + 1 );
        } );

        const frequencies: number[] = [ ...postsFrequencyMap.values() ];

        const maxTweetsPerDay: number = frequencies.length ? Math.max( ...frequencies ) : 0;
        const averageTweetsPerDay: number = frequencies.length ? Utils.getAverageValue( [ ...frequencies ] ): 0;
        const profileLifetime: number = Utils.getDaysDiff( new Date(), new Date( tweets[ tweets.length - 1 ].created_at ) );
        const averageTweetsPerDayOverall: number = Math.round(
            user.public_metrics.tweet_count / Utils.getDaysDiff( new Date(), new Date( user.created_at ) )
        );
        const inactiveDays: number = profileLifetime - [ ...postsFrequencyMap.keys() ].length ;

        const statistics: IReportsStatistics = await this._reportsModel.getStatistics();

        let mappedSources: string = '';

        for ( const [ source, count ] of Object.entries( sources ) ) {
            mappedSources += `<li>${ source }: <strong>${ ( ( count / tweets.length ) * 100 ).toFixed( 2 ) }%</strong></li>`;
        }

        return {
            value: `
            <ul class="details__list">
                <li>Last activity at: <strong>${ lastActivityAt.toISOString() }</strong></li>
                <li>Average number of posts in active days (scanned period): <strong ${ averageTweetsPerDay > statistics.averageTweetsPerDayActiveDays * 2 ? SUSPICIOUS_CONTENT_CLASS : '' }>${ averageTweetsPerDay }</strong> (counts only days where at least one tweet was posted)</li>
                <li>Average number of posts overall: <strong ${ averageTweetsPerDayOverall > statistics.averageTweetsPerDayOverall * 2 ? SUSPICIOUS_CONTENT_CLASS : '' }>${ averageTweetsPerDayOverall }</strong> (incl. inactive days)</li>
                <li>Number of inactive days in a given period: <strong>${ inactiveDays < 0 ? 0 : inactiveDays }</strong></li>
                <li>Max posts in a single day: <strong ${ maxTweetsPerDay > statistics.maxTweetsPerDay * 2 ? SUSPICIOUS_CONTENT_CLASS : '' }>${ maxTweetsPerDay }</strong></li>
                <li>Probably planned posts count: <strong ${ probablyPlannedPostsCount / user.public_metrics.tweet_count > SUSPICIOUS_PLANNED_POSTS_RATIO ? SUSPICIOUS_CONTENT_CLASS : '' }>${ probablyPlannedPostsCount } (${ probablyPlannedPostsCount ? ( ( probablyPlannedPostsCount / user.public_metrics.tweet_count ) * 100 ).toFixed( 2 ) : 0 }%)</strong></li>
                <li>Posts created via: <ul class="disc_list">${ mappedSources }</ul></li>
                <li>Number of scanned tweets (From: (${ new Date( tweets[ tweets.length - 1 ].created_at ).toISOString() })): <strong>${ tweets.length }</strong></li>
            </ul>
            `,
            explanation: `
                Average number of posts in active days for real accounts usually does not exceed a few dozens.<br>
                If overage average value is significantly different from average value from active days it may be an indicate that an account
                have a large peaks of activity with a long idle time between.<br>
                Probably planned posts count is a percentage ratio of posts <strong>PROBABLY</strong> planned via the posts planner.
                <p>Statistics for already scanned profiles:</p>
                <ul class="user_details__list">
                    <li>Average number of posts in active days: <strong>${ statistics.averageTweetsPerDayActiveDays.toFixed( 2 ) }</strong></li>
                    <li>Average number of posts overall: <strong>${ statistics.averageTweetsPerDayOverall.toFixed( 2 ) }</strong></li>
                    <li>Max posts in a single day: <strong>${ statistics.maxTweetsPerDay.toFixed( 2 ) }</strong></li>
                    <li>Probably planned posts count: <strong>${ statistics.probablyPlannedPostsCount.toFixed( 2 ) }</strong></li>
                </ul>
            `,
            dataToSave: {
                averageTweetsPerDayActiveDays: averageTweetsPerDay,
                averageTweetsPerDayOverall,
                probablyPlannedPostsCount: ( probablyPlannedPostsCount / user.public_metrics.tweet_count ) * 100,
                maxTweetsPerDay
            }   
        };
    }
}