import { IHttpClient, HttpResponse } from '../HttpClient';
import Scanner, { IScannerOutput } from './Scanner';
import Utils from '../Utils';

const SCANNER_URL = 'https://darwin.v7labs.com/ai/models/0e322ea6-3c51-4168-8a20-b25d0860664f/infer';

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

interface IGetUserDataResults {
    data: {
        name: string;
        username: string;
        profile_image_url: string;
        id: string;
    }
}

export default class ProfilePictureScanner extends Scanner {
    protected readonly _scannedElement: string = 'Profile picture scan report';

    public constructor( private readonly _httpClient: IHttpClient ) {
        super()
    }

    protected async _scan( profile: string ): Promise<IScannerOutput> {
        const getUserDataResults: HttpResponse = await this._httpClient.get(
            `https://api.twitter.com/2/users/by/username/${profile}?user.fields=profile_image_url`,
            { ...Utils.getTwitterAPIAuthHeaders() }
        );

        const user: IGetUserDataResults = await getUserDataResults.body.json();

        const profilePictureUrl: string = user.data.profile_image_url.replace( '_normal', '' ); // Get full size image URL.

        const base64ProfilePicture: string = await this._httpClient.download( profilePictureUrl, { base64: true } ) as string;

        const profilePictureScanResult: HttpResponse = await this._httpClient.post(
            SCANNER_URL,
            {
                image: {
                    base64: base64ProfilePicture
                }
            },
            {
                authorization: Utils.getDarwinLabsAPIKey(),
                'content-type': 'application/json'
            }
        );

        const response: IDarwinLabsScanResults = await profilePictureScanResult.body.json();

        const fakePercentage: string = `${ Math.round( response.result[ 0 ].inference.confidence * 100 ) }%`;

        return {
            value: `<img src="${ profilePictureUrl }"><p>${ response.result[ 0 ].label } (${ fakePercentage })<p>`,
            explanation: 'The metric bases on a model learned from artificially generated human faces created via e.g. <a href="thispersondoesnotexist.com" target="_blank">This Person Does Not Exist</a>'
        };
    }
}