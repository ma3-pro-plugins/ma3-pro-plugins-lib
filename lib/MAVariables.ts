import { decode, encode } from 'json';
import { objToString } from './DebugUtils';

const MAX_USER_VAR_LENGTH = 65535;

export function MAVariables(params: {
  storageType: 'UserProfile-PluginPreferences' | 'ShowFile' | 'User';
  variablesId: string;
}) {
  const { storageType, variablesId } = params;

  function _getVars() {
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

  function getVar(varName: string) {
    const vars = _getVars();
    return GetVar(vars, varName);
  }

  function deleteVar(varName: string) {
    const vars = _getVars();
    return DelVar(vars, varName);
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
    const vars = _getVars();
    return SetVar(vars, varName, value);
  }

  function setJsonVar(varName: string, value: object) {
    try {
      setVar(varName, encode(value));
    } catch (err: any) {
      error(`ERROR: setJsonVar(), ${variablesId}, ${varName}. value: ${objToString(value)}`);
    }
  }
  return {
    variablesId: variablesId,
    getVar,
    getJsonVar,
    setVar,
    setJsonVar,
    deleteVar,
  };
}

export type MAVariables = ReturnType<typeof MAVariables>;
