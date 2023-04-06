import { getTimeMillis } from "lib/TimeUtils"

export enum LogLevel {
    TRACE = 1,
    DEBUG = 2,
    INFO = 3,
    WARN = 4,
    ERROR = 5
}

const logLevelString = [
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
]

export function toLogLevelString(logLevel: LogLevel) {
    return logLevelString[logLevel - 1]
}

const DEFAULT_LOG_LEVEL = LogLevel.ERROR


type Params = {
    prefix?: string[],
    logLevel?: LogLevel
    withElappsedTimePrefixd?: boolean
}
/**
 * 
 * @param configs a config heirarchy (anscestors) of this logger
 */
export function Logger(params?: Params) {
    const { prefix, logLevel, withElappsedTimePrefixd } = params === undefined ? {} as Params : params
    const _prefix = (prefix ?? []).map(p => `[${p}]`).join("")
    const childLoggers: Logger[] = []

    // State
    let _logLevel = logLevel ?? DEFAULT_LOG_LEVEL
    let lastTimestamp: number | undefined

    function makeTimeStamp() {
        const curTime = getTimeMillis()
        const elapsed = lastTimestamp === undefined ? undefined : Math.round(curTime - lastTimestamp)
        lastTimestamp = curTime
        return elapsed
    }

    function _prefixMsg(msg: string) {
        let elapsed
        if (withElappsedTimePrefixd) {
            elapsed = makeTimeStamp()
        }
        const elapsedPart = withElappsedTimePrefixd ? `[${elapsed === undefined ? "?" : elapsed}ms]` : ""
        return `${_prefix}:${elapsedPart} ${msg}`
    }

    function _prefixMsgWithLevel(msg: string, logLevel: LogLevel) {
        let elapsed
        if (withElappsedTimePrefixd) {
            elapsed = makeTimeStamp()
        }
        const elapsedPart = withElappsedTimePrefixd ? `[${elapsed === undefined ? "?" : elapsed}ms]` : ""
        return `${_prefix}:${elapsedPart} ${logLevelString[logLevel - 1]} ${msg}`
    }

    function _printf(msg: string) {
        Printf(_prefixMsg(msg))
    }

    function _echo(msg: string) {
        Echo(_prefixMsg(msg))
    }

    function _trace(msg: string) {
        if (_logLevel <= LogLevel.TRACE) {
            Echo(_prefixMsgWithLevel(msg, LogLevel.TRACE))
        }
    }

    function _debug(msg: string) {
        if (_logLevel <= LogLevel.DEBUG) {
            Echo(_prefixMsgWithLevel(msg, LogLevel.DEBUG))
        }
    }

    function _info(msg: string) {
        if (_logLevel <= LogLevel.INFO) {
            Echo(_prefixMsgWithLevel(msg, LogLevel.INFO))
        }
    }
    function _warn(msg: string) {
        if (_logLevel <= LogLevel.WARN) {
            Echo(_prefixMsgWithLevel(msg, LogLevel.WARN))
        }
    }

    function _error(msg: string) {
        Echo(_prefixMsgWithLevel(msg, LogLevel.ERROR))
    }

    function subLogger(subPrefix: string) {
        const newLogger = Logger({ prefix: [...(prefix ?? []), subPrefix], logLevel: _logLevel })
        childLoggers.push(newLogger)
        return newLogger
    }

    function setLogLevel(logLevel: LogLevel) {
        _logLevel = logLevel
        for (const logger of childLoggers) {
            logger.setLogLevel(logLevel)
        }
    }

    return {
        msg: _prefixMsg,
        printf: _printf,
        echo: _echo,
        trace: _trace,
        debug: _debug,
        info: _info,
        warn: _warn,
        error: _error,
        subLogger,
        getLogLevel: () => _logLevel,
        setLogLevel
    }
}

export type Logger = ReturnType<typeof Logger>;