import { MAVariables } from './MAVariables';

/**
 * Creates an instance of a singleton object.
 * This singleton object is stored in a global variable.
 * If a new show is loaded, and the singleton is accessed again,
 * then the existing singleton is destroyed, and a new instance will be created.
 */
export function getOrCreateShowSingleton<T extends ShowSingleton>(globalId: string, create: () => T): T {
  const pluginAddonVars = MAVariables({
    storageType: 'ShowFile',
    variablesId: globalId,
  });

  function createInstance() {
    const instance = create();
    const objId = getId(instance);

    pluginAddonVars.setVar(INSTANCE_ID_VAR_NAME, objId);
    return instance;
  }

  if (GlobalVariable[globalId] === undefined) {
    GlobalVariable[globalId] = createInstance();
  } else {
    const instance = GlobalVariable[globalId];
    if (pluginAddonVars.getVar(INSTANCE_ID_VAR_NAME) !== getId(instance)) {
      // This means that the user loaded another show.
      instance.destroy();
      GlobalVariable[globalId] = createInstance();
    }
  }

  return GlobalVariable[globalId];
}

export interface ShowSingleton {
  destroy(): void;
}

const INSTANCE_ID_VAR_NAME = '_SHOW_SINGLETON_INSTANCE_ID';
const GlobalVariable = _G as any;

function getId(instance: ShowSingleton) {
  return tostring(instance); // Use LUA obj address
}

export function isShowSingletonExists(globalId: string) {
  return GlobalVariable[globalId] !== undefined;
}

export function getShowSingleton<T extends ShowSingleton>(globalId: string): T {
  const instance = GlobalVariable[globalId];
  assert(instance !== undefined, `Could not find Show Singleton globalId = ${globalId}`);
  return instance;
}
