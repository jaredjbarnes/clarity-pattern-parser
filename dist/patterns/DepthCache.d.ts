export declare class DepthCache {
    private _depthMap;
    getDepth(name: string, cursorIndex: number): number;
    incrementDepth(name: string, cursorIndex: number): void;
    decrementDepth(name: string, cursorIndex: number): void;
}
