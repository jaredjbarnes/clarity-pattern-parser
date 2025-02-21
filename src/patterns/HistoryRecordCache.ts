import { HistoryRecord } from "./HistoryRecord";
import { Pattern } from "./Pattern";

let hits = 0;
let miss = 0;

export function getHits() {
    return hits;
}

export function getEffiency() {
    return hits / (hits + miss);
}

export class HistoryRecordCache {
    private _size: number;
    private _records: HistoryRecord[];
    private _recordsMap: Record<string, HistoryRecord>;
    private _isEnabled: boolean;
    private _cacheHits: number;
    private _cacheMiss: number;

    get efficiency() {
        const total = this._cacheHits + this._cacheMiss;
        return this._cacheHits / total;
    }

    get cacheHits() {
        return this._cacheHits;
    }

    get cacheMiss() {
        return this._cacheMiss;
    }

    constructor(size: number) {
        this._size = size;
        this._records = [];
        this._recordsMap = {};
        this._isEnabled = true;
        this._cacheHits = 0;
        this._cacheMiss = 0;
    }

    add(record: HistoryRecord) {
        if (!this._isEnabled) {
            return;
        }

        this._records.push(record);
        this._recordsMap[this._getKey(record)] = record;

        this._manageSize();
    }

    private _getKey(record: HistoryRecord) {
        const index = this._getIndex(record);
        return `${record.pattern.id}|${index}`;
    }

    private _getIndex(record: HistoryRecord) {
        let index = 0;

        if (record.ast != null) {
            index = record.ast.startIndex;
        }

        if (record.error != null) {
            index = record.error.startIndex;
        }

        return index;
    }

    private _manageSize() {

        if (this._records.length <= this._size) {
            return;
        }

        const record = this._records.shift();

        if (record == null) {
            return;
        }

        delete this._recordsMap[this._getKey(record)];
    }

    get(pattern: Pattern, atIndex: number) {
        if (!this._isEnabled) {
            return null;
        }

        const key = `${pattern.id}|${atIndex}`;
        const result = this._recordsMap[key] || null;

        if (result == null) {
            miss++;
            this._cacheMiss++;
        } else {
            hits++;
            this._cacheHits++;
        }

        return result;
    }

    enable() {
        this._isEnabled = true;
    }

    disable() {
        this._isEnabled = false;
    }

    clear() {
        this._records.length = 0;
        this._recordsMap = {};
    }
}