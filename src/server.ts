import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Service from './Service';
import Router from './Router';
import RootController from './controllers/RootController';
import ScanResultController from './controllers/ScanResultController';
import { Browser } from 'puppeteer';
import BrowserWorker from './BrowserWorker';
import HttpClient from './HttpClient';
import ScannersFactory from './scanners/base/ScannerFactory';
import ReportsModel from './models/ReportsModel';

dotenv.config();

const dbPort: number = Number( process.env.DB_PORT ) || 27017;
const dbHost: string = process.env.DB_HOST || 'mongo';
const port: number = Number( process.env.PORT ) || 3000;

( async () => {
    const service: Service = new Service( port );
    const browserWorker: BrowserWorker = new BrowserWorker();

    await browserWorker.launch();

    console.log( 'Browser Worker launched' );

    await mongoose.connect(
        `mongodb://${ process.env.MONGO_INITDB_ROOT_USERNAME }:${ process.env.MONGO_INITDB_ROOT_PASSWORD}@${ dbHost }:${ dbPort }`
    );

    console.log( 'DB connection established' );

    const browser: Browser = browserWorker.browser;
    const httpClient: HttpClient = new HttpClient();

    const reportsModel: ReportsModel = new ReportsModel( mongoose );
    const scannersFactory: ScannersFactory = new ScannersFactory( browser, httpClient );

    const rootController: RootController = new RootController();
    const scanResultController: ScanResultController = new ScanResultController( scannersFactory, httpClient, reportsModel );

    const router: Router = new Router(
        [
            {
                method: 'get',
                path: '/',
                controller: rootController
            },
            {
                method: 'post',
                path: '/scan-result',
                controller: scanResultController
            }
        ]
    );

    service.addRouter( '/', router );
} )();