import Utils from '../Utils';

const DEFAULT_WAIT_TASK_TIMEOUT: number = 60 * 1000;

export interface IScanner {
    scan( profile: string ): Promise<string>;
}

export default abstract class Scanner implements IScanner {
    protected abstract readonly _scannedElement: string;

    protected abstract _scan( profile: string ): Promise<string>;

    public async scan( profile: string ): Promise<string> {
        const scanResultPromise: Promise<string> = new Promise( ( resolve ) => {
            resolve( this._scan( profile ) );
        } );

        try {
            const result: string | void = await Promise.race( [
                scanResultPromise,
                Utils.wait( DEFAULT_WAIT_TASK_TIMEOUT )
            ] );

            if ( result ) {
                return `<td>${ this._scannedElement }</td><td>${ result }</td>`;
            }

            return `<td>${ this._scannedElement }</td><td>Scan timeout. Try to scan again.</td>`;
        } catch ( error ) {
            console.error( `Scanning ${ this._scannedElement } failed. Reason: `, error );

            return `<td>${ this._scannedElement }</td><td>Scan could not be processed correctly</td>`;
        }
    }
}

