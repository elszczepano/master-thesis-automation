import { IncomingHttpHeaders } from 'http';

import dotenv from 'dotenv';

dotenv.config();

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
}