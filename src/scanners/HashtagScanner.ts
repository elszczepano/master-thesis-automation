import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';

const HASHTAG_FREQUENCY_LIMIT: number = 20;

export default class HashtagScanner extends Scanner {
    protected readonly _scannedElement: string = 'Most used hashtags';

    public constructor() {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        let hashtags: string[] = [];

        tweets.map( tweet => {
            let currentTweetHashtags: string[] = tweet.text.split( ' ' ).filter( word => word.startsWith( '#' ) );

            hashtags = [ ...hashtags, ...currentTweetHashtags ];
        } );

        const hashtagsFrequency: [ string, number ][] = Utils.sortByFrequency( hashtags );

        if ( !hashtagsFrequency.length ) {
            return {
                value: 'N/A',
                explanation: 'The scanned profile does not use hashtags.'
            }
        }

        let value = '<p>Most frequent hashtags:</p><ul class="hashtags_frequency">';

        // Get only the most frequently used hashtags
        for ( const [ hashtag, frequency ] of hashtagsFrequency.slice( 0, HASHTAG_FREQUENCY_LIMIT ) ) {
            value += `<li><a href="https://twitter.com/hashtag/${ hashtag }" target="_blank"><strong>${ hashtag }</strong></a> (${ frequency } ${ frequency == 1 ? 'occurrence' : 'occurrences' })</li>`;
        }

        value = value + '</ul>';

        return {
            value,
            explanation: `Returns used hashtags with the number of occurrences in an descending order (up to ${ HASHTAG_FREQUENCY_LIMIT } most frequent hashtags).`
        };
    }

}