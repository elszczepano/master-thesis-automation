import { Browser } from 'puppeteer';

import HttpClient from '../../HttpClient';
import { IScanner } from './Scanner';

import EmailAddressScanner from '../EmailAddressScanner';
import ProfilePictureScanner from '../ProfilePictureScanner';
import UserDetailsScanner from '../UserDetailsScanner';
import PostsFrequencyScanner from '../PostsFrequencyScanner';
import DailyPostsFrequencyScanner from '../DailyPostsFrequencyScanner';
import EmojiScanner from '../EmojiScanner';

export default class ScannersFactory {
    private readonly _scanners: IScanner[] = [];

    public constructor( browser: Browser, httpClient: HttpClient ) {
        const emailAddressScanner: EmailAddressScanner = new EmailAddressScanner( browser );
        const profilePictureScanner: ProfilePictureScanner = new ProfilePictureScanner( httpClient );
        const userDetailsScanner: UserDetailsScanner = new UserDetailsScanner();
        const postsFrequencyScanner: PostsFrequencyScanner = new PostsFrequencyScanner();
        const emojiScanner: EmojiScanner = new EmojiScanner();
        const dailyPostsFrequencyScanner: DailyPostsFrequencyScanner = new DailyPostsFrequencyScanner();

        this._scanners.push( userDetailsScanner );
        this._scanners.push( postsFrequencyScanner );
        this._scanners.push( emailAddressScanner );
        this._scanners.push( profilePictureScanner );
        this._scanners.push( dailyPostsFrequencyScanner );
        this._scanners.push( emojiScanner );
    }

    public get scanners(): IScanner[] {
        return this._scanners;
    }
}