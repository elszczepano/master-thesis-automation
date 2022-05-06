export interface IScanner {
    scan( profile: string ): Promise<string>;
    name: string;
}