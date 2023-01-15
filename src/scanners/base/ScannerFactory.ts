import { Browser } from 'puppeteer';

import HttpClient from '../../HttpClient';
import { IScanner } from './Scanner';
import ReportsModel from '../../models/ReportsModel';

import EmailAddressScanner from '../EmailAddressScanner';
import ProfilePictureScanner from '../ProfilePictureScanner';
import UserDetailsScanner from '../UserDetailsScanner';
import PostsFrequencyScanner from '../PostsFrequencyScanner';
import DailyPostsFrequencyScanner from '../DailyPostsFrequencyScanner';
import EmojiScanner from '../EmojiScanner';
import HashtagScanner from '../HashtagScanner';
import MentionsAndLikesScanner from '../MentionsAndLikesScanner';
import KnownProfilesScanner from '../KnownProfilesScanner';
import OtherSitesScanner from '../OtherSitesScanner';
import MostPopularPostsScanner from '../MostPopularPostsScanner';
import GeolocationScanner from '../GeolocationScanner';
import UsedLanguageScanner from '../UsedLanguageScanner';

export default class ScannersFactory {
    private readonly _scanners: IScanner[] = [];

    public constructor( browser: Browser, httpClient: HttpClient, reportsModel: ReportsModel ) {
        const emailAddressScanner: EmailAddressScanner = new EmailAddressScanner( browser );
        const profilePictureScanner: ProfilePictureScanner = new ProfilePictureScanner( httpClient );
        const userDetailsScanner: UserDetailsScanner = new UserDetailsScanner( reportsModel );
        const postsFrequencyScanner: PostsFrequencyScanner = new PostsFrequencyScanner( reportsModel );
        const emojiScanner: EmojiScanner = new EmojiScanner();
        const hashtagScanner: HashtagScanner = new HashtagScanner();
        const mentionsAndLikesScanner: MentionsAndLikesScanner = new MentionsAndLikesScanner( httpClient );
        const dailyPostsFrequencyScanner: DailyPostsFrequencyScanner = new DailyPostsFrequencyScanner();
        const knownProfilesScanner: KnownProfilesScanner = new KnownProfilesScanner();
        const otherSitesScanner: OtherSitesScanner = new OtherSitesScanner();
        const mostPopularPostsScanner: MostPopularPostsScanner = new MostPopularPostsScanner();
        const geolocationScanner: GeolocationScanner = new GeolocationScanner( httpClient );
        const usedLanguageScanner: UsedLanguageScanner = new UsedLanguageScanner();

        this._scanners.push( userDetailsScanner );
        this._scanners.push( postsFrequencyScanner );
        this._scanners.push( emailAddressScanner );
        this._scanners.push( profilePictureScanner );
        this._scanners.push( dailyPostsFrequencyScanner );
        this._scanners.push( emojiScanner );
        this._scanners.push( hashtagScanner );
        this._scanners.push( mentionsAndLikesScanner );
        this._scanners.push( knownProfilesScanner );
        this._scanners.push( otherSitesScanner );
        this._scanners.push( mostPopularPostsScanner );
        this._scanners.push( geolocationScanner );
        this._scanners.push( usedLanguageScanner );
    }

    public get scanners(): IScanner[] {
        return this._scanners;
    }
}