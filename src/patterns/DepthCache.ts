export class DepthCache {
    private _depthMap: Record<string, Record<number, number>> = {};

    getDepth(name: string, cursorIndex: number) {
        if (this._depthMap[name] == null) {
            this._depthMap[name] = {};
        }

        if (this._depthMap[name][cursorIndex] == null) {
            this._depthMap[name][cursorIndex] = 0;
        }


        return this._depthMap[name][cursorIndex];
    }

    incrementDepth(name: string, cursorIndex: number) {
        const depth = this.getDepth(name, cursorIndex);
        this._depthMap[name][cursorIndex] = depth + 1;
    }

    decrementDepth(name: string, cursorIndex: number) {
        const depth = this.getDepth(name, cursorIndex);
        this._depthMap[name][cursorIndex] = depth - 1;
    }
}