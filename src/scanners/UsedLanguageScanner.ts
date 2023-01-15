import { ITweet } from '../controllers/ScanController';
import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';

// SEE: https://twittercommunity.com/t/unkown-language-code-qht-returned-by-api/172819/3
const EXCLUDED_LANGS: string[] = [ 'qam', 'und', 'qct', 'qht', 'qme', 'zxx', 'qst', 'art' ];

export default class KnownProfiesScanner extends Scanner {
    protected readonly _scannedElement: string = 'Used languages';

    public constructor() {
        super()
    }

    protected async _scan( { tweets }: IScannerParams ): Promise<IScannerOutput> {
        let value: string = '<ul>';

        const filteredTweets: ITweet[] = tweets.filter( tweet => !EXCLUDED_LANGS.includes( tweet.lang ) );

        let langs: string[] = [];

        filteredTweets.map( tweet => langs.push( tweet.lang ) );

        const frequencies: [ string, number ][] = Utils.sortByFrequency( langs );

        for ( const [ lang , count ] of frequencies ) {
            // Skip non-important languages, false-positives etc.
            if ( count / filteredTweets.length < 0.05 ) {
                continue;
            }

            value += `<li>${ lang } - ${ count } posts (${ ( count / filteredTweets.length * 100 ).toFixed( 2 ) }%)</li>`;
        }

        value += '</ul>'

        return {
            value,
            explanation: '<p> The list contains the list of languages used by a scanned profile.<p>'
        };
    }
}