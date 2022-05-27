import dotenv from 'dotenv';

import Service from './Service';
import Router from './Router';
import RootController from './controllers/RootController';
import ProfileReportController from './controllers/ProfileReportController';
import { Browser } from 'puppeteer';
import BrowserWorker from './BrowserWorker';
import HttpClient from './HttpClient';
import ScannersFactory from './scanners/ScannerFactory';

dotenv.config();

const port: number = Number( process.env.PORT ) || 3000;

console.log( process.env.PORT, port );

( async () => {
    const service: Service = new Service( port );
    const browserWorker: BrowserWorker = new BrowserWorker();

    await browserWorker.launch();

    const browser: Browser = browserWorker.browser;
    const httpClient: HttpClient = new HttpClient();

    const scannersFactory: ScannersFactory = new ScannersFactory( browser, httpClient );

    const rootController: RootController = new RootController();
    const profileReportController: ProfileReportController = new ProfileReportController( scannersFactory );

    const router: Router = new Router(
        [
            {
                method: 'get',
                path: '/',
                controller: rootController
            },
            {
                method: 'post',
                path: '/profile-report',
                controller: profileReportController
            }
        ]
    );

    service.addRouter( '/', router );
} )();