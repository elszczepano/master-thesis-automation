import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';

const EMOJIS_FREQUENCY_LIMIT: number = 20;

export default class EmojiScanner extends Scanner {
    protected readonly _scannedElement: string = 'Most used emojis';

    public constructor() {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        let emojis: string[] = [];

        tweets.map( tweet => {
            let currentTweetEmojis: string[] = tweet.text.match( /\p{Emoji}+/gu ) ?? []

            // Trim numbers and special characters. See: https://unicode.org/Public/emoji/11.0/emoji-data.txt
            // TL;DR; numbers and special chars are emojis
            currentTweetEmojis = currentTweetEmojis.filter( emoji => Number.isNaN( Number( emoji ) ) );
            currentTweetEmojis = currentTweetEmojis.filter(
                emoji => ![ '*', '#', '▶', '‼', '▪' ].some( char => emoji.trim().includes( char ) )
            );

            emojis = [ ...emojis, ...currentTweetEmojis ];
        } );

        const emojisFrequency: [ string, number ][] = Utils.sortByFrequency( emojis );

        if ( !emojisFrequency.length ) {
            return {
                value: 'N/A',
                explanation: 'The scanned profile does not use emojis.'
            }
        }

        let value = '<p>Most frequent emojis:</p><ul class="emojis_frequency">';

        // Get only the most frequently used emojis
        for ( const [ emoji, frequency ] of emojisFrequency.slice( 0, EMOJIS_FREQUENCY_LIMIT ) ) {
            value += `<li>${ emoji } (${ frequency } ${ frequency == 1 ? 'occurrence' : 'occurrences' })</li>`;
        }

        value = value + '</ul>';

        return {
            value,
            explanation: `Returns used emojis with the number of occurrences in an descending order (up to ${ EMOJIS_FREQUENCY_LIMIT } most frequent emojis).`
        };
    }
}