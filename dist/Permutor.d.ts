export default class Permutor {
    array: Array<Array<string>>;
    positionToOptions: {
        [key: string]: string[];
    };
    constructor();
    permute(array: any): any;
    getPermutations(): any;
    getKey(x: number, y: number): string;
    createPositionMap(): void;
    getOptions(x: number, y: number): string[];
    setOptions(x: number, y: number, value: string[]): void;
}
