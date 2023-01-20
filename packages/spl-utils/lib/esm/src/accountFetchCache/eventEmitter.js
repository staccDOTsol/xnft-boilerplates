import { EventEmitter as Emitter } from "eventemitter3";
export class CacheUpdateEvent {
    static type = "CacheUpdate";
    id;
    parser;
    isNew;
    constructor(id, isNew, parser) {
        this.id = id;
        this.parser = parser;
        this.isNew = isNew;
    }
}
export class CacheDeleteEvent {
    static type = "CacheDelete";
    id;
    constructor(id) {
        this.id = id;
    }
}
export class EventEmitter {
    emitter = new Emitter();
    onCache(callback) {
        this.emitter.on(CacheUpdateEvent.type, callback);
        return () => this.emitter.removeListener(CacheUpdateEvent.type, callback);
    }
    raiseCacheUpdated(id, isNew, parser) {
        this.emitter.emit(CacheUpdateEvent.type, new CacheUpdateEvent(id, isNew, parser));
    }
    raiseCacheDeleted(id) {
        this.emitter.emit(CacheDeleteEvent.type, new CacheDeleteEvent(id));
    }
}
//# sourceMappingURL=eventEmitter.js.map