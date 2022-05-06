import { Browser } from 'puppeteer';

import HttpClient from '../HttpClient';
import EmailAddressScanner from './EmailAddressScanner';

import { IScanner } from './Scanner';

export default class ScannersFactory {
    private readonly _scanners: IScanner[] = [];

    public constructor(
        browser: Browser,
        httpClient: HttpClient
    ) {
        const emailAddressScanner: EmailAddressScanner = new EmailAddressScanner( browser );

        this._scanners.push( emailAddressScanner );
    }

    public get scanners(): IScanner[] {
        return this._scanners;
    }
}