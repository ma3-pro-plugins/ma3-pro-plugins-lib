export function PluginInfo(...args: any[]): {
  pluginObjectName: string;
  componentName: string;
  signalTable: object;
  componentHandle: LuaComponent;
} {
  return {
    pluginObjectName: args[0] as any as string,
    componentName: args[1] as any as string,
    signalTable: args[2],
    componentHandle: args[3],
  };
}

export type PluginInfo = ReturnType<typeof PluginInfo>;
