import Service from './Service';
import Router from './Router';
import RootController from './controllers/RootController';

const port: number = Number( process.env.PORT ) || 3000;

( async () => {
    const service: Service = new Service( port );

    const rootController: RootController = new RootController();

    const router: Router = new Router(
        [
            {
                method: 'get',
                path: '/',
                controller: rootController
            }
        ]
    );

    service.addRouter( '/', router );
} )();