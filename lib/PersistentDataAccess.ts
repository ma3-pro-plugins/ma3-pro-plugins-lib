import { TimeUtils } from './TimeUtils';
import { decode, encode } from 'json';
import { series } from 'lib/Utils';
import { Logger } from 'lib/Logger';
import { MAVariables, MAX_USER_VAR_LENGTH } from 'lib/MAVariables';

export interface PersistentData<D> {
  getData(): D;
  setDirty(): void;
}

const CHUNK_SIZE = MAX_USER_VAR_LENGTH;
const DEFAULT_IS_DIRTY_ENABLED = true;
/**
 * Stores data in persistent storage, using MAVariables.
 * Automatically creates variable chunks if the data is too big.
 *
 */
export function PersistentDataAccess<Data extends object>(
  vars: MAVariables,
  varName: string,
  _log: Logger,
  options?: {
    /**
     * If false then isDirty() will always return true
     * Default is true
     */
    isDirtyEnabled?: boolean;
  }
) {
  const log = _log.subLogger(`PersistentDataAccess(${vars.variablesId})`);
  let _data: Data | undefined;
  let isDirty = false;

  const readChunksString = () => {
    let dataString = '';
    let chunkIndex = -1;
    let chunk;
    do {
      chunkIndex++;
      chunk = vars.getVar(createChunkName(varName, chunkIndex));

      if (chunk !== undefined) {
        dataString += chunk;
      }
    } while (chunk !== undefined);

    return { dataString, numOfChunks: chunkIndex };
  };

  return {
    variablesId: vars.variablesId,
    varName,
    isDirty() {
      const enabled = options?.isDirtyEnabled === undefined ? DEFAULT_IS_DIRTY_ENABLED : options?.isDirtyEnabled;
      return enabled ? isDirty : true; // Always dirty
    },
    isCachedDataExists(): boolean {
      return _data !== undefined;
    },
    /**
     * Does any data exist in the persistent storage
     */
    isDataExists(): boolean {
      return vars.getVar(varName) !== undefined;
    },
    readRaw() {
      return readChunksString();
    },
    /**
     * Read from persistent storage
     * @returns true if data was found and read succesfully in persistent storage
     */
    read() {
      log.trace(`read() START`);

      const { dataString, numOfChunks } = readChunksString();

      if (dataString === null || dataString === undefined) {
        return false;
      } else {
        log.trace(`read() concatenated ${numOfChunks} chunks. Now Decoding START`);
        const decodeStart = TimeUtils.getTimeMillis();
        _data = decode(dataString) as Data;
        log.trace(`read() decoding DONE in ${TimeUtils.getTimeMillis() - decodeStart} ms`);
        isDirty = false;
        return true;
      }
    },
    setDirty() {
      if (!isDirty) {
        log.trace(`setDirty(): was false now true`);
        isDirty = true;
      }
    },
    write() {
      log.trace(`write() START`);
      if (_data === undefined) {
        error(`PesistentDataAccess.write(): data is undefined`);
      }

      const encodeStart = TimeUtils.getTimeMillis();
      const encodedData = encode(_data);
      log.trace(`write() encoding DONE in ${TimeUtils.getTimeMillis() - encodeStart} ms`);
      const numOfChunks = Math.ceil(encodedData.length / CHUNK_SIZE);
      for (const chunkIndex of series(0, numOfChunks - 1)) {
        vars.setVar(
          createChunkName(varName, chunkIndex),
          encodedData.slice(chunkIndex * CHUNK_SIZE, (chunkIndex + 1) * CHUNK_SIZE)
        );
      }

      // Remove any extra chunks
      let chunkIndexToDelete = numOfChunks;
      let numOfDeletedChunks = 0;
      while (vars.getVar(createChunkName(varName, chunkIndexToDelete)) !== undefined) {
        vars.deleteVar(createChunkName(varName, chunkIndexToDelete));
        chunkIndexToDelete++;
        numOfDeletedChunks++;
      }

      log.trace(`write() AFTER writing ${numOfChunks} chunks (Deleted ${numOfDeletedChunks} chukns)`);
      isDirty = false;
      return this;
    },

    cleanUp() {
      log.trace(`Delete var ${varName}`);
      vars.deleteVar(varName);
      vars.cleanup();
    },
    /**
     * Get the plugin data object. Any changes in it would be written to persitent storage once PersistentDataAccess.write() is called.
     * @returns
     */
    getData() {
      // log.trace(`getData()`)
      if (_data === undefined) {
        error(
          `PesistentDataAccess(${vars.variablesId}).getData(): data is undefined. Probably 'read()' was not called`
        );
      }
      return _data;
    },

    setData(data: Data) {
      log.trace(`setData()`);
      _data = data;
      isDirty = true;
      return this;
    },
  };
}

/**
 *
 * @param baseVarName
 * @param index 0 based
 */
function createChunkName(baseVarName: string, index: number) {
  return `${baseVarName}${index === 0 ? '' : `_${index}`}`;
}

export type PersistentDataAccess<P extends object> = ReturnType<typeof PersistentDataAccess<P>>;
