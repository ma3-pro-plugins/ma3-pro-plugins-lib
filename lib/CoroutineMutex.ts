import { Logger } from './Logger';

const TIMEOUT_SEC = 2;

export type IMutex = {
  /**
   * Thread id as a string
   */
  tid: string;
  /**
   * Locks the mutex.
   * If the mutex is already locked, the calling thread will be suspended until the mutex is unlocked.
   * If the mutex is locked by the current thread, then it returns immediately with 'ok'
   * @returns 'ok' if the lock was acquired, 'timeout' if the lock could not be acquired within the timeout period.
   */
  lock(): 'ok' | 'timeout';
  /**
   * Tries to lock the mutex without blocking.
   * @returns true if the lock was acquired, false otherwise
   */
  tryLock(): boolean;
  unlock(): void;
  destroy(): void;
  isDestroyed(): boolean;
  setLog(newLog: Logger): void;
};

/**
 * A mutex implementaiton using coroutines.
 */
export function CoroutineMutex(log?: Logger, onDestroy?: (tid: string) => void): IMutex {
  let co: LuaThread | undefined = createCoroutine();
  let selfLog = log;
  coroutine.resume(co);
  const tid = tostring(co);

  return {
    tid,
    lock,
    tryLock,
    unlock,
    destroy,
    isDestroyed,
    setLog(newLog: Logger) {
      selfLog = newLog;
    },
  };

  function isDestroyed() {
    return co === undefined;
  }

  function destroy() {
    if (co !== undefined) {
      log?.trace(`destroy co=${tostring(co)}`);
      coroutine.resume(co, undefined, 'kill');
      co = undefined;
      onDestroy && onDestroy(tid);
    }
  }

  function unlock() {
    if (co !== undefined) {
      const tid = tostring(coroutine.running()[0]);
      return coroutine.resume(co, tid, 'unlock');
    }
  }

  function tryLock(): boolean {
    if (co !== undefined) {
      const tid = tostring(coroutine.running()[0]);
      const [res, success] = coroutine.resume(co, tid, 'lock');
      log?.trace(`tryLock(): res=${res},success=${success}`);
      return success as boolean;
    }
    error('tryLock: Mutex destroyed already');
  }

  function lock(): 'ok' | 'timeout' {
    if (co !== undefined) {
      let ts = os.time();
      const tid = tostring(coroutine.running()[0]);
      let success: boolean = false;

      do {
        const [res, success] = coroutine.resume(co, tid, 'lock');
        // log?.trace(`res=${res},success=${success}`);

        if (success === true) {
          return 'ok';
        } else {
          coroutine.yield();
        }
        if (os.time() - ts > TIMEOUT_SEC) {
          // destroy();
          // error(`Deadlock Detected - destroyed mutex`);
          return 'timeout';
        }
      } while (!success);
    }
    error('not initialized or destroyed');
  }

  function createCoroutine() {
    return coroutine.create(() => {
      let curTid: string | undefined;
      let keepGoing = true;
      let curAction: 'kill' | 'lock' | 'unlock' | 'initial' = 'initial';
      let requestTid: string | undefined;
      let lockCount: number = 0;

      const isLocked = () => {
        return curTid !== undefined;
      };

      while (keepGoing) {
        switch (curAction) {
          case 'initial': {
            const [_requestTid, _action] = coroutine.yield();
            requestTid = _requestTid;
            curAction = _action;
            break;
          }
          case 'kill': {
            keepGoing = false;
            break;
          }
          case 'lock': {
            if (isLocked()) {
              if (requestTid === curTid) {
                lockCount++;
                const [_requestTid, _action] = coroutine.yield(true);
                requestTid = _requestTid;
                curAction = _action;
              } else {
                const [_requestTid, _action] = coroutine.yield(false);
                requestTid = _requestTid;
                curAction = _action;
              }
            } else {
              curTid = requestTid;
              lockCount++;
              const [_requestTid, _action] = coroutine.yield(true);
              requestTid = _requestTid;
              curAction = _action;
            }
            break;
          }
          case 'unlock': {
            let success = false;
            if (isLocked()) {
              if (curTid === requestTid) {
                lockCount--;
                if (lockCount === 0) {
                  curTid = undefined;
                }
                success = true;
              } else {
                selfLog?.warn(`unlock() called from a thread which is not the locking thread`);
              }
            } else {
              selfLog?.warn(`unlock() mutex is not locked`);
            }
            const [_requestTid, _action] = coroutine.yield(success);
            requestTid = _requestTid;
            curAction = _action;
            break;
          }
        }
      }
      selfLog?.trace(`coroutine ended co=${tostring(co)}`);
    });
  }
}

export type CoroutineMutex = ReturnType<typeof CoroutineMutex>;
