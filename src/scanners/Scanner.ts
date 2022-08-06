import Utils from '../Utils';

const DEFAULT_WAIT_TASK_TIMEOUT: number = 60 * 1000;
const INVALID_SCAN_PLACEHOLDER: string = 'N/A';

export interface IScanner {
    scan( profile: string ): Promise<IScannerReport>;
}

export interface IScannerReport extends IScannerOutput {
    element: string;
}

export interface IScannerOutput {
    value: string;
    explanation: string;
}

export default abstract class Scanner implements IScanner {
    protected abstract readonly _scannedElement: string;

    protected abstract _scan( profile: string ): Promise<IScannerOutput>;

    public async scan( profile: string ): Promise<IScannerReport> {
        const scanResultPromise: Promise<IScannerOutput> = new Promise( ( resolve ) => {
            resolve( this._scan( profile ) );
        } );

        try {
            const result: IScannerOutput | void = await Promise.race( [
                scanResultPromise,
                Utils.wait( DEFAULT_WAIT_TASK_TIMEOUT )
            ] );

            if ( result ) {
                return {
                    element: this._scannedElement,
                    value: result.value,
                    explanation: result.explanation
                };
            }

            return {
                element: this._scannedElement,
                value: INVALID_SCAN_PLACEHOLDER,
                explanation: 'Scan timeout. Try to scan again.'
            };
        } catch ( error ) {
            console.error( `Scanning ${ this._scannedElement } failed. Reason: `, error );

            return {
                element: this._scannedElement,
                value: INVALID_SCAN_PLACEHOLDER,
                explanation: 'Scan could not be processed correctly'
            };
        }
    }
}

