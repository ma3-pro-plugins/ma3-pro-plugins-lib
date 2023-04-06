local ____lualib = require("lualib_bundle")
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local __TS__Unpack = ____lualib.__TS__Unpack
local __TS__SparseArrayNew = ____lualib.__TS__SparseArrayNew
local __TS__SparseArrayPush = ____lualib.__TS__SparseArrayPush
local __TS__SparseArraySpread = ____lualib.__TS__SparseArraySpread
local __TS__SourceMapTraceBack = ____lualib.__TS__SourceMapTraceBack
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["10"] = 1,["11"] = 1,["12"] = 3,["13"] = 4,["14"] = 4,["15"] = 5,["16"] = 5,["17"] = 6,["18"] = 6,["19"] = 7,["20"] = 7,["21"] = 8,["22"] = 8,["23"] = 11,["24"] = 11,["25"] = 11,["26"] = 11,["27"] = 11,["28"] = 11,["29"] = 11,["30"] = 19,["31"] = 20,["32"] = 19,["33"] = 23,["36"] = 35,["37"] = 36,["38"] = 36,["39"] = 36,["40"] = 36,["41"] = 37,["42"] = 37,["43"] = 37,["44"] = 37,["45"] = 37,["46"] = 37,["47"] = 37,["48"] = 38,["49"] = 41,["50"] = 42,["51"] = 44,["52"] = 45,["53"] = 46,["54"] = 46,["55"] = 46,["57"] = 46,["59"] = 46,["60"] = 47,["61"] = 48,["62"] = 44,["63"] = 51,["64"] = 52,["65"] = 53,["66"] = 54,["68"] = 56,["69"] = 57,["70"] = 51,["71"] = 60,["72"] = 61,["73"] = 62,["74"] = 63,["76"] = 65,["77"] = 66,["78"] = 60,["79"] = 69,["80"] = 70,["81"] = 69,["82"] = 73,["83"] = 74,["84"] = 73,["85"] = 77,["86"] = 78,["87"] = 79,["89"] = 77,["90"] = 83,["91"] = 84,["92"] = 85,["94"] = 83,["95"] = 89,["96"] = 90,["97"] = 91,["99"] = 89,["100"] = 94,["101"] = 95,["102"] = 96,["104"] = 94,["105"] = 100,["106"] = 101,["107"] = 100,["108"] = 104,["109"] = 105,["110"] = 105,["111"] = 105,["112"] = 105,["113"] = 105,["114"] = 105,["115"] = 105,["116"] = 105,["117"] = 105,["118"] = 105,["119"] = 106,["120"] = 107,["121"] = 104,["122"] = 110,["123"] = 111,["124"] = 112,["125"] = 113,["127"] = 110,["128"] = 117,["129"] = 117,["130"] = 117,["131"] = 117,["132"] = 117,["133"] = 117,["134"] = 117,["135"] = 117,["136"] = 117,["137"] = 117,["138"] = 117,["139"] = 117,["140"] = 117,["141"] = 35});
local ____exports = {}
local ____TimeUtils = require("TimeUtils")
local getTimeMillis = ____TimeUtils.getTimeMillis
____exports.LogLevel = LogLevel or ({})
____exports.LogLevel.TRACE = 1
____exports.LogLevel[____exports.LogLevel.TRACE] = "TRACE"
____exports.LogLevel.DEBUG = 2
____exports.LogLevel[____exports.LogLevel.DEBUG] = "DEBUG"
____exports.LogLevel.INFO = 3
____exports.LogLevel[____exports.LogLevel.INFO] = "INFO"
____exports.LogLevel.WARN = 4
____exports.LogLevel[____exports.LogLevel.WARN] = "WARN"
____exports.LogLevel.ERROR = 5
____exports.LogLevel[____exports.LogLevel.ERROR] = "ERROR"
local logLevelString = {
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR"
}
function ____exports.toLogLevelString(self, logLevel)
    return logLevelString[logLevel]
end
local DEFAULT_LOG_LEVEL = ____exports.LogLevel.ERROR
---
-- @param configs a config heirarchy (anscestors) of this logger
function ____exports.Logger(self, params)
    local ____temp_0 = params == nil and ({}) or params
    local prefix = ____temp_0.prefix
    local logLevel = ____temp_0.logLevel
    local withElappsedTimePrefixd = ____temp_0.withElappsedTimePrefixd
    local _prefix = table.concat(
        __TS__ArrayMap(
            prefix or ({}),
            function(____, p) return ("[" .. p) .. "]" end
        ),
        ""
    )
    local childLoggers = {}
    local _logLevel = logLevel or DEFAULT_LOG_LEVEL
    local lastTimestamp
    local function makeTimeStamp(self)
        local curTime = getTimeMillis(nil)
        local ____temp_1
        if lastTimestamp == nil then
            ____temp_1 = nil
        else
            ____temp_1 = math.floor(curTime - lastTimestamp + 0.5)
        end
        local elapsed = ____temp_1
        lastTimestamp = curTime
        return elapsed
    end
    local function _prefixMsg(self, msg)
        local elapsed
        if withElappsedTimePrefixd then
            elapsed = makeTimeStamp(nil)
        end
        local elapsedPart = withElappsedTimePrefixd and ("[" .. tostring(elapsed == nil and "?" or elapsed)) .. "ms]" or ""
        return (((_prefix .. ":") .. elapsedPart) .. " ") .. msg
    end
    local function _prefixMsgWithLevel(self, msg, logLevel)
        local elapsed
        if withElappsedTimePrefixd then
            elapsed = makeTimeStamp(nil)
        end
        local elapsedPart = withElappsedTimePrefixd and ("[" .. tostring(elapsed == nil and "?" or elapsed)) .. "ms]" or ""
        return (((((_prefix .. ":") .. elapsedPart) .. " ") .. logLevelString[logLevel]) .. " ") .. msg
    end
    local function _printf(self, msg)
        Printf(_prefixMsg(nil, msg))
    end
    local function _echo(self, msg)
        Echo(_prefixMsg(nil, msg))
    end
    local function _trace(self, msg)
        if _logLevel <= ____exports.LogLevel.TRACE then
            Echo(_prefixMsgWithLevel(nil, msg, ____exports.LogLevel.TRACE))
        end
    end
    local function _debug(self, msg)
        if _logLevel <= ____exports.LogLevel.DEBUG then
            Echo(_prefixMsgWithLevel(nil, msg, ____exports.LogLevel.DEBUG))
        end
    end
    local function _info(self, msg)
        if _logLevel <= ____exports.LogLevel.INFO then
            Echo(_prefixMsgWithLevel(nil, msg, ____exports.LogLevel.INFO))
        end
    end
    local function _warn(self, msg)
        if _logLevel <= ____exports.LogLevel.WARN then
            Echo(_prefixMsgWithLevel(nil, msg, ____exports.LogLevel.WARN))
        end
    end
    local function _error(self, msg)
        Echo(_prefixMsgWithLevel(nil, msg, ____exports.LogLevel.ERROR))
    end
    local function subLogger(self, subPrefix)
        local ____exports_Logger_3 = ____exports.Logger
        local ____array_2 = __TS__SparseArrayNew(__TS__Unpack(prefix or ({})))
        __TS__SparseArrayPush(____array_2, subPrefix)
        local newLogger = ____exports_Logger_3(
            nil,
            {
                prefix = {__TS__SparseArraySpread(____array_2)},
                logLevel = _logLevel
            }
        )
        childLoggers[#childLoggers + 1] = newLogger
        return newLogger
    end
    local function setLogLevel(self, logLevel)
        _logLevel = logLevel
        for ____, logger in ipairs(childLoggers) do
            logger:setLogLevel(logLevel)
        end
    end
    return {
        msg = _prefixMsg,
        printf = _printf,
        echo = _echo,
        trace = _trace,
        debug = _debug,
        info = _info,
        warn = _warn,
        error = _error,
        subLogger = subLogger,
        getLogLevel = function() return _logLevel end,
        setLogLevel = setLogLevel
    }
end
return ____exports
