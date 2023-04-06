declare type LuaError = {
    name: string,
    stack: string,
    message: string
}

export function getErrorMessage(err: string | LuaError | ProError | any) {
    return typeof err === 'string' ?
        err :
        typeof err === 'object' ?
            (err as LuaError | ProError).message ?? "No Error Message" :
            "Unknown"
}

export interface ProError {
    type: 'ProError',
    message: string,
    tracebackPrinted: boolean,
}

/**
 * This replaces TSTL's try/catch (which uses pcall)
 * since it uses xpcall, that captures the FULL traceback.
 */
export function protectedCall<T>(params: {
    fn: () => T,
    onError: (err: ProError) => void,
    errorPrefix?: string
}): { success: boolean, returnValue: T | undefined } {
    const { fn, onError, errorPrefix } = params
    let proError: ProError = { type: "ProError", message: "", tracebackPrinted: false }

    function errorMsgHandler(this: void, err: string | LuaError | undefined | ProError) {
        // Echo("errorMsgHandler: " + typeof err === 'object' ? DebugUtils.objToString(err as object) : err)
        if (typeof err === 'object' && (err as ProError).type === "ProError" && (err as ProError).tracebackPrinted) {
            return
        }
        proError.message = getErrorMessage(err)
        Echo(`${errorPrefix ?? ""} ERROR : ${proError.message}`)
        Echo(debug.traceback())
        proError.tracebackPrinted = true
    }

    const [status, retVal] = xpcall(() => fn(), (err) => errorMsgHandler(err))

    if (!status) {
        onError(proError!)
        return { success: false, returnValue: undefined }
    } else {
        return { success: true, returnValue: retVal }
    }
}
