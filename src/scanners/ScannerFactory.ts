import { Browser } from 'puppeteer';

import HttpClient from '../HttpClient';
import EmailAddressScanner from './EmailAddressScanner';
import ProfilePictureScanner from './ProfilePictureScanner';

import { IScanner } from './Scanner';

export default class ScannersFactory {
    private readonly _scanners: IScanner[] = [];

    public constructor(
        browser: Browser,
        httpClient: HttpClient
    ) {
        const emailAddressScanner: EmailAddressScanner = new EmailAddressScanner( browser );
        const profilePictureScanner: ProfilePictureScanner = new ProfilePictureScanner( browser, httpClient );

        this._scanners.push( emailAddressScanner );
        this._scanners.push( profilePictureScanner );
    }

    public get scanners(): IScanner[] {
        return this._scanners;
    }
}