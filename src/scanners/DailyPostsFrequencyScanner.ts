import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';

const HOURS_IN_DAY: number = 24;

export default class PostsFrequencyScanner extends Scanner {
    protected readonly _scannedElement: string = 'Posts frequency';

    public constructor() {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        const postsFrequencyMap: Map<number, number> = new Map();

        for ( let hour = 0; hour < HOURS_IN_DAY; hour++ ) {
            postsFrequencyMap.set( hour, 0 );
        }

        tweets.map( tweet => {
            const tweetDate: Date = new Date( tweet.created_at );
            const hour: number = tweetDate.getHours();
            const currentHourFrequency: number = postsFrequencyMap.get( hour )!;

            postsFrequencyMap.set( hour, currentHourFrequency + 1 );
        } );

        let value = '<p>Hourly posts frequency. Timezone: <strong>CEST (Central European Summer Time) UTC/GMT+2 hours)</strong>:</p><ul class="posts_frequency">';

        for ( let hour = 0; hour < HOURS_IN_DAY; hour++ ) {
            const postsCount: number = postsFrequencyMap.get( hour )!;

            if ( !postsCount ){
                continue;
            }

            value += `<li>${ hour } - <strong>${ postsCount }</strong> posts</li>`;
        }

        value = value + '</ul>';

        if ( !tweets.length ) {
            value = 'N/A - no posts found';
        }

        return {
            value,
            explanation: `
            How many posts were added in a given hour.
            Note that the posts timezone is <strong>CEST (Central European Summer Time) UTC/GMT+2 hours)</strong>.
            Hours where there are no posts has been skipped.
            `
        };
    }
}