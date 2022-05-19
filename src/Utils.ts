export default class Utils {
    public static wait( ms: number ): Promise<void> {
        return new Promise( ( resolve: () => void ) => setTimeout( resolve, ms ) );
    }
}