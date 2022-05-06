import { Browser } from 'puppeteer';

import { IScanner } from './Scanner';

export default class EmailAddressScanner implements IScanner {
    public constructor( private readonly _browser: Browser ) {}

    public scan(): Promise<string> {

    }

    public get name() {
        return 'EmailScanner';
    }
}