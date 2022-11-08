import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Service from './Service';
import Router from './Router';
import RootController from './controllers/RootController';
import ScanController from './controllers/ScanController';
import DownloadReportController from './controllers/DownloadReportController';
import DownloadDatasetContentController from './controllers/DownloadDatasetContentController';
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
    const scannersFactory: ScannersFactory = new ScannersFactory( browser, httpClient, reportsModel );

    const rootController: RootController = new RootController( reportsModel );
    const scanController: ScanController = new ScanController( scannersFactory, httpClient, reportsModel );
    const downloadReportController: DownloadReportController = new DownloadReportController( reportsModel );
    const downloadDatasetContentController: DownloadDatasetContentController = new DownloadDatasetContentController( reportsModel );

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
                controller: scanController
            },
            {
                method: 'get',
                path: '/download-report/:username',
                controller: downloadReportController
            },
            {
                method: 'get',
                path: '/download-dataset',
                controller: downloadDatasetContentController
            }
        ]
    );

    service.addRouter( '/', router );
} )();