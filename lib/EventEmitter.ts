import { Logger } from './Logger';

/**
 * Taken from here: https://gist.github.com/mudge/5830382?permalink_comment_id=2658721#gistcomment-2658721
 */
export interface EventBase {
  eventName: string;
}
type Listener<Event extends EventBase> = (event: Event) => void;

export interface EventDispatcher<E> {
  /**
   * Adds the event to the event queue.
   * Multiple events of the same eventName, will be ignored.
   * @param event
   */
  emit(event: E): void;
}

export interface EventRegistry<E extends EventBase> {
  on(eventName: E['eventName'], listener: Listener<E>): () => void;
  onAny(listener: Listener<E>): () => void;
  removeListener(eventName: E['eventName'], listener: Listener<E>): void;
  once(event: E, listener: Listener<E>): () => void;
}

export class EventEmitter<Event extends EventBase> implements EventDispatcher<Event>, EventRegistry<Event> {
  private readonly eventsListeners: {
    [eventName: string]: Listener<Event>[];
  } = {};
  private readonly anyEventsListeners: Listener<Event>[] = [];

  constructor(readonly log: Logger) {}

  /**
   * Add listener to a specific event
   * @param eventName
   * @param listener If listener already exists it will NOT be added again
   * @returns
   */
  public on(eventName: Event['eventName'], listener: Listener<Event>): () => void {
    if (typeof this.eventsListeners[eventName] !== 'object') {
      this.eventsListeners[eventName] = [];
    }
    const listeners = this.eventsListeners[eventName];
    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }
    return () => this.removeListener(eventName, listener);
  }

  /**
   * Add listener to a specific event
   * @param eventName
   * @param listener If listener already exists it will NOT be added again
   * @returns
   */
  public onAny(listener: Listener<Event>): () => void {
    const listeners = this.anyEventsListeners;
    if (!listeners.includes(listener)) {
      listeners.push(listener);
    }
    return () => {
      const idx: number = this.anyEventsListeners.indexOf(listener);
      if (idx > -1) {
        this.anyEventsListeners.splice(idx, 1);
      }
    };
  }

  public removeListener(eventName: Event['eventName'], listener: Listener<Event>): void {
    if (typeof this.eventsListeners[eventName] !== 'object') {
      return;
    }

    const idx: number = this.eventsListeners[eventName].indexOf(listener);
    if (idx > -1) {
      this.eventsListeners[eventName].splice(idx, 1);
    }
  }

  public removeAllListeners(): void {
    Object.keys(this.eventsListeners).forEach((event: string) =>
      this.eventsListeners[event].splice(0, this.eventsListeners[event].length)
    );
    this.anyEventsListeners.splice(0, this.anyEventsListeners.length);
  }

  public emit(event: Event): void {
    let lastErr: any;

    // Call specific event listener
    if (typeof this.eventsListeners[event.eventName] === 'object') {
      const thisEventListeners = this.eventsListeners[event.eventName];
      this.log.trace(`Event [${event.eventName}], calling ${thisEventListeners.length} listeners`);
      thisEventListeners.forEach((listener, index) => {
        try {
          listener.apply(this, [event]);
        } catch (err) {
          lastErr = err;
        }
      });
    } else {
      this.log.trace(`Event [${event.eventName}] - no specific listeners`);
    }

    // Call any-event listener
    this.log.trace(`Event [${event.eventName}] - Calling ${this.anyEventsListeners.length} any-event listeners`);
    this.anyEventsListeners.forEach((listener, index) => {
      try {
        listener.apply(this, [event]);
      } catch (err) {
        lastErr = err;
      }
    });

    if (lastErr !== undefined) {
      throw lastErr;
    }
  }

  public once(event: Event, listener: Listener<Event>): () => void {
    const remove: () => void = this.on(event.eventName, (...args: any[]) => {
      remove();
      listener.apply(this, [event]);
    });

    return remove;
  }
}
