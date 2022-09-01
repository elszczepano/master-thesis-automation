import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';

const MENTIONS_FREQUENCY_LIMIT: number = 20;

export default class MentionScanner extends Scanner {
    protected readonly _scannedElement: string = 'Most mentioned accounts';

    public constructor() {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        let mentions: string[] = [];

        tweets.map( tweet => {
            let currentTweetMentions: string[] = tweet.text.split( ' ' ).filter( word => word.startsWith( '@' ) );

            mentions = [ ...mentions, ...currentTweetMentions ];
        } );

        const mentionsFrequency: Record<string, number> = Utils.sortByFrequency( Utils.countFrequency( mentions ) );

        if ( !Object.keys( mentionsFrequency ).length ) {
            return {
                value: 'N/A',
                explanation: 'The scanned profile does not use mentions.'
            }
        }

        let value = '<p>Most frequent mentions:</p><ul class="mentions_frequency">';

        // Get only the most frequently used mentions
        for ( const [ mention, frequency ] of Object.entries( mentionsFrequency ).slice( 0, MENTIONS_FREQUENCY_LIMIT ) ) {
            value += `<li><strong>${ mention }</strong> (${ frequency } ${ frequency == 1 ? 'occurrence' : 'occurrences' })</li>`;
        }

        value = value + '</ul>';

        return {
            value,
            explanation: `Returns used mentions with the number of occurrences in an descending order (up to ${ MENTIONS_FREQUENCY_LIMIT } most frequent mentions).`
        };
    }

}