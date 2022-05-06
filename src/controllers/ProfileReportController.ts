import { Request, Response } from 'express';

import ScannersFactory from '../scanners/ScannerFactory';
import { IScanner } from '../scanners/Scanner';
import { IController } from './Controller';

interface IRequestBody {
    profile: string;
}

export default class ProfileReportController implements IController {
    public constructor( private readonly _scannersFactory: ScannersFactory ) {}

    public async execute( request: Request, response: Response ): Promise<void> {
        const { profile }: IRequestBody = request.body;

        const scanners: IScanner[] = this._scannersFactory.scanners;

        const results: string[] = [];

        for ( const scanner of scanners ) {
            const result: string = await scanner.scan( profile );

            results.push( result );
        }

        response.render( 'profile_report_view', { profile, results } );
    }
}