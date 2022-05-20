import { Browser, Page, ElementHandle } from 'puppeteer';
import dotenv from 'dotenv';

import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner from './Scanner';

dotenv.config();

const SCANNER_URL = 'https://darwin.v7labs.com/ai/models/0e322ea6-3c51-4168-8a20-b25d0860664f/infer';
const API_KEY = `ApiKey ${ process.env.DARWIN_LABS_API_KEY }`;

interface IDarwinLabsScanResults {
    action: string;
    result: {
        inference: {
            confidence: number;
            model: {
                id: string;
                name: string;
                type: string;
            }
        },
        label: string;
        name: string;
        tag: Record<string, unknown>;
    }[];
}

export default class ProfilePictureScanner extends Scanner {
    protected readonly _scannedElement: string = 'Profile picture scan report';

    public constructor(
        private readonly _browser: Browser,
        private readonly _httpClient: IHttpClient
    ) {
        super()
    }

    protected async _scan( profile: string ): Promise<string> {
        const page: Page = await this._browser.newPage();

        // Pretend that we do not use a headless browser
        await page.setUserAgent(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
        );

        // Make sure the English page version is fetched
        await page.setExtraHTTPHeaders( { 'Accept-Language': 'en-US,en;q=0.9' } );

        const imageContainer: string = 'img[alt=Image]';

        await page.goto( `https://twitter.com/${ profile }/photo` );

        const element: ElementHandle | null = await page.waitForSelector( imageContainer );

        if ( !element ) {
            return '<td>Profile picture scan report</td><td>Cannot download a profile picture</td>';
        }

        const profilePictureUrl: string = await element.evaluate( ( el: any ) => el.src );

        const base64ProfilePicture: string = await this._httpClient.download( profilePictureUrl, { base64: true } ) as string;

        const profilePictureScanResult: HttpResponse = await this._httpClient.post(
            SCANNER_URL,
            {
                image: {
                    base64: base64ProfilePicture
                }
            },
            {
                authorization: API_KEY,
                'content-type': 'application/json'
            }
        );

        const response: IDarwinLabsScanResults = await profilePictureScanResult.body.json();

        const fakePercentage: string = `${ Math.round( response.result[ 0 ].inference.confidence * 100 ) }%`;

        return `<img src="${ profilePictureUrl }"><p>${ response.result[ 0 ].label } (${ fakePercentage })<p>`;
    }
}