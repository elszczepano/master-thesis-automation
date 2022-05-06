export interface IScanner {
    scan(): Promise<string>;
    name: string;
}