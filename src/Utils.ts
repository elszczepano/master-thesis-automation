import { IncomingHttpHeaders } from 'http';

import dotenv from 'dotenv';

dotenv.config();

const DAY_LENGTH: number = 1000 * 60 * 60 * 24;

export default class Utils {
    public static wait( ms: number ): Promise<void> {
        return new Promise( ( resolve: () => void ) => setTimeout( resolve, ms ) );
    }

    public static getTwitterAPIAuthHeaders(): IncomingHttpHeaders {
        return {
            'Authorization': `Bearer ${ process.env.BEARER_TOKEN }`
        }
    }

    public static getDarwinLabsAPIKey(): string {
        return `ApiKey ${ process.env.DARWIN_LABS_API_KEY }`;
    }

    public static getAverageValue( numbers: number[] ): number {
        return Math.round( numbers.reduce( ( a, b ) => a + b ) / numbers.length );
    }

    public static getDaysDiff( date1: Date, date2: Date ): number {
        const diffTime: number = Math.abs( date2.getTime() - date1.getTime() );

        return Math.ceil( diffTime / ( DAY_LENGTH ) );
    }
}