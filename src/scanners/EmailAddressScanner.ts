import { Browser, Page } from 'puppeteer';

import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';

export default class EmailAddressScanner extends Scanner {
    protected readonly _scannedElement: string = 'Email address';

    public constructor( private readonly _browser: Browser ) {
        super() 
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        const page: Page = await this._browser.newPage();

        await page.setJavaScriptEnabled( true );

        // Pretend that we do not use a headless browser
        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
        );

        // Make sure the English page version is fetched
        await page.setExtraHTTPHeaders( { 'Accept-Language': 'en-US,en;q=0.9' } );

        const resetPasswordInputField: string = 'input[name=username]'; 
        const resetPasswordButton: string = 'div[data-testid="ocfEnterTextNextButton"]';

        await page.goto('https://twitter.com/i/flow/password_reset');

        // Fill the reset password form
        await page.waitForSelector( resetPasswordInputField );
        await page.type( resetPasswordInputField, user.username );
        await page.click( resetPasswordButton );

        // Wait for page load
        await page.waitForTimeout( 1000 );
        
        // Search for email field via X-Path.
        const [ resetPasswordElement ] = await page.$x( `//span[contains(text(),'Email')]` );

        let email: string = '';

        if ( resetPasswordElement ) {
            email = ( await resetPasswordElement.evaluate( el => el.textContent ) as string ).replace( /(.*)to /, "" );
        }

        return {
            value: email || 'Email address cannot be found - Twitter page was not reachable or rate limit has been reached.',
            explanation: 'Email can be fetched only in an obfuscated form. Please check if it matches to some pattern with other scanned accounts.'
        };
    }
}