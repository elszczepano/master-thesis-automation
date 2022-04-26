import dotenv from 'dotenv';

import Service from './Service';
import Router from './Router';
import RootController from './controllers/RootController';
import ProfileReportController from './controllers/ProfileReportController';

dotenv.config();

const port: number = Number( process.env.PORT ) || 3000;

( async () => {
    const service: Service = new Service( port );

    const rootController: RootController = new RootController();
    const profileReportController: ProfileReportController = new ProfileReportController();

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