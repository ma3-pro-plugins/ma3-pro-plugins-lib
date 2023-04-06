local ____lualib = require("lualib_bundle")
local __TS__SourceMapTraceBack = ____lualib.__TS__SourceMapTraceBack
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["5"] = 1,["6"] = 1,["7"] = 3,["8"] = 4,["9"] = 3});
local ____exports = {}
local ____socket = require("socket")
local gettime = ____socket.gettime
function ____exports.getTimeMillis(self)
    return gettime() * 1000
end
return ____exports
