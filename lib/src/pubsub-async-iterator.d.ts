import { PubSubEngine } from 'graphql-subscriptions';
/**
 * A class for digesting PubSubEngine events via the new AsyncIterator interface.
 * This implementation is a generic version of the one located at
 * https://github.com/apollographql/graphql-subscriptions/blob/master/src/event-emitter-to-async-iterator.ts
 * @class
 *
 * @constructor
 *
 * @property pullQueue @type {Function[]}
 * A queue of resolve functions waiting for an incoming event which has not yet arrived.
 * This queue expands as next() calls are made without PubSubEngine events occurring in between.
 *
 * @property pushQueue @type {any[]}
 * A queue of PubSubEngine events waiting for next() calls to be made.
 * This queue expands as PubSubEngine events arrice without next() calls occurring in between.
 *
 * @property eventsArray @type {string[]}
 * An array of PubSubEngine event names which this PubSubAsyncIterator should watch.
 *
 * @property allSubscribed @type {Promise<number[]>}
 * A promise of a list of all subscription ids to the passed PubSubEngine.
 *
 * @property listening @type {boolean}
 * Whether or not the PubSubAsynIterator is in listening mode (responding to incoming PubSubEngine events and next() calls).
 * Listening begins as true and turns to false once the return method is called.
 *
 * @property pubsub @type {PubSubEngine}
 * The PubSubEngine whose events will be observed.
 */
export declare class PubSubAsyncIterator<T> implements AsyncIterator<T> {
    private pullQueue;
    private pushQueue;
    private eventsArray;
    private allSubscribed;
    private listening;
    private pubsub;
    constructor(pubsub: PubSubEngine, eventNames: string | string[]);
    next(): Promise<IteratorResult<any>>;
    return(): Promise<IteratorResult<any>>;
    throw(err: any): Promise<never>;
    private pushValue;
    private pullValue;
    private emptyQueue;
    private subscribeAll;
    private unsubscribeAll;
}
