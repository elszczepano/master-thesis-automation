import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner, { IScannerOutput, IScannerParams } from './base/Scanner';
import Utils from '../Utils';

const SCANNER_URL: string = 'https://darwin.v7labs.com/ai/models/0e322ea6-3c51-4168-8a20-b25d0860664f/infer';
const FAKE_PERSON_LABEL: string = 'Likely Fake Person';

interface IV7LabsScanResults {
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

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( { user }: IScannerParams ): Promise<IScannerOutput> {
        const profilePictureUrl: string = user.profile_image_url.replace( '_normal', '' ); // Get full size image URL.

        const base64ProfilePicture: string = await this._httpClient.download( profilePictureUrl, { base64: true } ) as string;

        const profilePictureScanResult: HttpResponse = await this._httpClient.post(
            SCANNER_URL,
            {
                image: {
                    base64: base64ProfilePicture
                }
            },
            {
                authorization: Utils.getV7LabsAPIKey(),
                'content-type': 'application/json'
            }
        );

        const response: IV7LabsScanResults = await profilePictureScanResult.body.json();

        const fakePercentage: string = `${ Math.round( response.result[ 0 ].inference.confidence * 100 ) }%`;

        return {
            value: `<img src="${ profilePictureUrl }"><p ${ response.result[ 0 ].label === FAKE_PERSON_LABEL ? 'class="suspicious_content"': '' }>${ response.result[ 0 ].label } (${ fakePercentage })<p>`,
            explanation: 'The metric bases on a model learned from artificially generated human faces created via e.g. <a href="https://thispersondoesnotexist.com" target="_blank">This Person Does Not Exist</a>'
        };
    }
}