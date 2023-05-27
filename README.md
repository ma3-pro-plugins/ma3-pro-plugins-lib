# ma3-pro-plugins-lib

TypeScript Library for grandMA3 plugins

## Utils

- Logger
- DebugUtils: objToString() help printing objects (Like JSON.stringify()a)
- XMLUtils: XML parser
- FileUtils: Some convenience utils
- ImageLibraryUtils: create base64 images, install and import.
- ErrorHandlingUtils: catch error with full stack traceback
- CoroutineMutex: A Mutex implementation using coroutines. You might need it if you start using MA features that include mutli-threading like: MIDI Remotes, Custom Dialogs or Object hooks.
- MAVariables: A convenience wrapper of User Variable, Show variables, Plugin Variables. With json codec.
- ShowSingleton: Creates a singleton global object instance and limits access to it only from the current show.
- PluginInfo: Just a simple object to hold the info that the system provides about a plugin and pass it around.
