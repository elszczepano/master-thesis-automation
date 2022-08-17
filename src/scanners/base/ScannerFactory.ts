import { Browser } from 'puppeteer';

import HttpClient from '../../HttpClient';
import EmailAddressScanner from '../EmailAddressScanner';
import ProfilePictureScanner from '../ProfilePictureScanner';
import UserDetailsScanner from '../UserDetailsScanner';
import EmojiScanner from '../EmojiScanner';

import { IScanner } from './Scanner';
import PostsFrequencyScanner from '../PostsFrequencyScanner';

export default class ScannersFactory {
    private readonly _scanners: IScanner[] = [];

    public constructor( browser: Browser, httpClient: HttpClient ) {
        const emailAddressScanner: EmailAddressScanner = new EmailAddressScanner( browser );
        const profilePictureScanner: ProfilePictureScanner = new ProfilePictureScanner( httpClient );
        const userDetailsScanner: UserDetailsScanner = new UserDetailsScanner();
        const postsFrequencyScanner: PostsFrequencyScanner = new PostsFrequencyScanner();
        const emojiScanner: EmojiScanner = new EmojiScanner();

        this._scanners.push( userDetailsScanner );
        this._scanners.push( postsFrequencyScanner );
        this._scanners.push( emailAddressScanner );
        this._scanners.push( profilePictureScanner );
        this._scanners.push( emojiScanner );
    }

    public get scanners(): IScanner[] {
        return this._scanners;
    }
}