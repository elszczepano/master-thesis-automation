import { Browser } from 'puppeteer';

import HttpClient from '../HttpClient';
import EmailAddressScanner from './EmailAddressScanner';
import ProfilePictureScanner from './ProfilePictureScanner';
import UserDetailsScanner from './UserDetailsScanner';

import { IScanner } from './Scanner';

export default class ScannersFactory {
    private readonly _scanners: IScanner[] = [];

    public constructor(
        browser: Browser,
        httpClient: HttpClient
    ) {
        const emailAddressScanner: EmailAddressScanner = new EmailAddressScanner( browser );
        const profilePictureScanner: ProfilePictureScanner = new ProfilePictureScanner( httpClient );
        const userDetailsScanner: UserDetailsScanner = new UserDetailsScanner( httpClient );

        this._scanners.push( userDetailsScanner );
        this._scanners.push( emailAddressScanner );
        this._scanners.push( profilePictureScanner );
    }

    public get scanners(): IScanner[] {
        return this._scanners;
    }
}