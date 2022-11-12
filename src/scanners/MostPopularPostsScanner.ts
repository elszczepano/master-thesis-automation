import { ITweet } from '../controllers/ScanController';

import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';

const MOST_POPULAR_POSTS_COUNT: number = 20;

export default class UserDetailsScanner extends Scanner {
    protected readonly _scannedElement: string = 'Most popular posts';

    public constructor() {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        const explanation: string = `
            The ${ MOST_POPULAR_POSTS_COUNT } most popular posts count.
            To determine the popularity of a given posts the following metrics are taken into account:
            <ul class="disc_list">
                <li>Likes count</li>
                <li>Retweets count</li>
                <li>Replies count</li>
                <li>Quote count</li>
            </ul>
        `;

        if ( !tweets.length ) {
            return { value: 'User did not post anything yet.', explanation };
        }

        // Filter out retweets
        const tweetsCopy: ITweet[] = [ ...tweets ].filter( tweet => !tweet.text.startsWith( 'RT' ) );

        tweetsCopy.sort( ( prev, next ) => {
            const prevRank: number = prev.public_metrics.like_count +
            prev.public_metrics.reply_count +
            prev.public_metrics.quote_count +
            prev.public_metrics.retweet_count;

            const nextRank: number = next.public_metrics.like_count +
                next.public_metrics.reply_count +
                next.public_metrics.quote_count +
                next.public_metrics.retweet_count;

            return nextRank - prevRank;
        } );

        let mostPopularTweets: string = '';

        for ( let i = 0; i < MOST_POPULAR_POSTS_COUNT; i++ ) {
            const tweet: ITweet | undefined = tweetsCopy[ i ];

            if ( !tweet ) {
                break;
            }

            mostPopularTweets += `<li>${ tweet.text }</li>`;
        }

        return {
            value: `<ol>${ mostPopularTweets }</ol>`,
            explanation
        };
    }
}