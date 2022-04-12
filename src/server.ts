import Service from './Service';
import Router from './Router';

const port: number = Number( process.env.PORT ) ?? 3000;

( async () => {
    const service: Service = new Service( port );

    const router: Router = new Router();

    service.addRouter( '/', router );
} )();