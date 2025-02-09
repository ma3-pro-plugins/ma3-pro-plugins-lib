import { decode, encode } from 'json';
import { objToString } from './DebugUtils';

export const MAX_USER_VAR_LENGTH = 65535;

export function MAVariables(params: {
  storageType: 'UserProfile-PluginPreferences' | 'ShowFile' | 'User';
  variablesId: string;
}) {
  const { storageType, variablesId } = params;

  function _getOrCreateVars() {
    if (storageType === 'UserProfile-PluginPreferences') {
      const pluginPreferences = PluginVars(variablesId);
      if (pluginPreferences === undefined) {
        error(`Could not find PluginVars with id=${variablesId}`);
      } else {
        return pluginPreferences(variablesId)[1];
      }
    } else if (storageType === 'ShowFile') {
      return AddonVars(variablesId);
    } else {
      return UserVars();
    }
  }

  function isVariablesExist() {
    if (storageType === 'ShowFile') {
      return Root().ShowData.ShowSettings.AddonVariables[variablesId] !== undefined;
    } else {
      // TODO: check if PluginVars exist
      return true;
    }
  }

  function getVar(varName: string) {
    return isVariablesExist() ? GetVar(_getOrCreateVars(), varName) : undefined;
  }

  function deleteVar(varName: string) {
    if (isVariablesExist()) {
      return DelVar(_getOrCreateVars(), varName);
    }
  }

  function getJsonVar<T extends object>(varName: string) {
    const value = getVar(varName);
    if (value === undefined) {
      return undefined;
    }
    return decode(value) as T;
  }

  function setVar(varName: string, value: string) {
    assert(
      value.length <= MAX_USER_VAR_LENGTH,
      string.format(
        'setVar(): pluginId=%s, varName=%s, value exceeds length limit of ',
        variablesId,
        varName,
        MAX_USER_VAR_LENGTH
      )
    );
    const vars = _getOrCreateVars();
    return SetVar(vars, varName, value);
  }

  function setJsonVar(varName: string, value: object) {
    try {
      setVar(varName, encode(value));
    } catch (err: any) {
      error(`ERROR: setJsonVar(), ${variablesId}, ${varName}. value: ${objToString(value)}`);
    }
  }

  function cleanup() {
    if (storageType === 'ShowFile') {
      const vars = Root().ShowData.ShowSettings.AddonVariables[variablesId];
      if (vars !== undefined) {
        const index = vars.index;
        Root().ShowData.ShowSettings.AddonVariables.Delete(index);
      }
    } else {
      // TODO
    }
  }

  return {
    variablesId: variablesId,
    getVar,
    getJsonVar,
    setVar,
    setJsonVar,
    deleteVar,
    cleanup,
  };
}

export type MAVariables = ReturnType<typeof MAVariables>;
