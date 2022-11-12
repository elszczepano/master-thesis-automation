import { exec } from 'child_process';

import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';

const MAIGRET_TIMEOUT_IN_SECONDS: number = 20;
const URL_REGEX: RegExp = /([\w+]+\:\/\/)?([\w\d-]+\.)*[\w-]+[\.\:]\w+([\/\?\=\&\#.]?[\w-]+)*\/?/g

export default class UserDetailsScanner extends Scanner {
    protected readonly _scannedElement: string = 'Other sites';

    public constructor() {
        super()
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        const explanation: string = `
            Results from <a href="https://github.com/soxoj/maigret" target="_blank">Maigret</a> library call.
            The library scan other websites to find profiles with the same name as the provided one.
            Note that <strong>the library produces a lot of false-positives</strong> so please verify links manually.
        `;

        const { stdout } = await exec( `maigret ${ user.username } --timeout ${ MAIGRET_TIMEOUT_IN_SECONDS } --retries 0` );

        let maigretResult: string = ' \n';

        if ( !stdout ) {
            throw new Error( 'Scanning profile using Maigret did not work' );
        }

        setTimeout( () => stdout.emit( 'end' ), ( MAIGRET_TIMEOUT_IN_SECONDS + 2 ) * 1000 );

        for await ( const chunk of stdout ) {
            maigretResult += chunk + '\n';
        }

        const urls: string[] | undefined = maigretResult.match( URL_REGEX )?.filter( url => url.startsWith( 'http' ) );

        if ( !urls?.length ) {
            return {
                value: '<p>Maigret scan results did not return any results</p>',
                explanation,
            };
        }

        let urlsHtml: string = '';

        for ( const url of urls ) {
            urlsHtml += `<li><a href="${ url }" target="_blank" class="maigret-link">${ url }</a></li>`;
        }

        return {
            value:`
                <p>Maigret returned the following links:</p>
                <ul>${ urlsHtml }</ul>
            `,
            explanation
        };
    }
}