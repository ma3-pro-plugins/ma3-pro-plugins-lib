local ____lualib = require("lualib_bundle")
local __TS__Unpack = ____lualib.__TS__Unpack
local __TS__StringReplace = ____lualib.__TS__StringReplace
local __TS__SourceMapTraceBack = ____lualib.__TS__SourceMapTraceBack
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["7"] = 1,["8"] = 1,["9"] = 1,["10"] = 1,["11"] = 1,["12"] = 3,["13"] = 5,["14"] = 6,["15"] = 5,["16"] = 9,["17"] = 9,["18"] = 10,["19"] = 9,["20"] = 13,["21"] = 14,["22"] = 15,["23"] = 16,["24"] = 17,["25"] = 18,["26"] = 19,["27"] = 13,["28"] = 22,["29"] = 23,["30"] = 24,["31"] = 25,["32"] = 22,["33"] = 28,["34"] = 29,["35"] = 30,["36"] = 31,["38"] = 33,["39"] = 34,["40"] = 34,["41"] = 34,["42"] = 34,["43"] = 35,["45"] = 28,["46"] = 39,["47"] = 40,["48"] = 41,["49"] = 39,["50"] = 44,["51"] = 45,["52"] = 46,["53"] = 44,["54"] = 49,["55"] = 50,["56"] = 49,["57"] = 53,["58"] = 54,["59"] = 53,["60"] = 63,["61"] = 64,["62"] = 63,["63"] = 67,["64"] = 68,["65"] = 67,["68"] = 75,["69"] = 76,["70"] = 77,["71"] = 78,["72"] = 79,["73"] = 80,["74"] = 81,["75"] = 82,["76"] = 83,["78"] = 85,["82"] = 89,["83"] = 75,["84"] = 92,["85"] = 93,["86"] = 94,["87"] = 95,["88"] = 96,["89"] = 97,["90"] = 98,["91"] = 99,["95"] = 103,["96"] = 92,["97"] = 106,["98"] = 106,["99"] = 106,["100"] = 106,["101"] = 106,["102"] = 106,["103"] = 106,["104"] = 106,["105"] = 106,["106"] = 106,["107"] = 106,["108"] = 106,["109"] = 106,["110"] = 106});
local ____exports = {}
local ____lfs = require("lfs")
local attributes = ____lfs.attributes
local dir = ____lfs.dir
local mkdir = ____lfs.mkdir
local rmdir = ____lfs.rmdir
local PATH_SEPERATOR = "/"
local function makeDir(self, path)
    return mkdir(path)
end
local function path(self, ...)
    local pathParts = {...}
    return table.concat(pathParts, PATH_SEPERATOR or ",")
end
local function readFile(self, filePath)
    local temp = io.input()
    io.input(filePath)
    local fileContent = io.read("a")
    io.input():close()
    io.input(temp)
    return fileContent
end
local function openFileForWriting(self, fileName)
    local fileWrapper = assert({io.open(fileName, "w")})
    local file = __TS__Unpack(fileWrapper)
    return file
end
local function writeBinaryFile(self, fileName, data)
    local out = io.open(fileName, "wb")
    if out == nil then
        error("Could not open file for binary writing: " .. fileName)
    else
        local _, err = out:write(data)
        assert(
            err == nil,
            "Could not write to file: " .. tostring(err)
        )
        assert(out:close())
    end
end
local function writeLine(self, fp, line)
    fp:write(line)
    fp:write("\n")
end
local function closeFile(self, fp)
    fp:flush()
    fp:close()
end
local function escapeObjNameForPath(self, name)
    return __TS__StringReplace(name, "/", "_")
end
function ____exports.escapeFileName(self, name)
    return name:gsub("[,'`]", "_")
end
local function exists(self, path)
    return attributes(path) ~= nil
end
local function isDir(self, path)
    return attributes(path).mode == "directory"
end
--- Get directory content
-- Taken from gma3_helpers.lua
local function getDirectoryContent(self, path)
    local resTable = {}
    for file in dir(path) do
        if file ~= "." and file ~= ".." then
            local currentPath = (path .. GetPathSeparator()) .. file
            local attr = attributes(currentPath)
            assert(type(attr) == "table")
            if attr.mode == "directory" then
                resTable[#resTable + 1] = {type = "directory", fullPath = currentPath, name = file}
            else
                resTable[#resTable + 1] = {type = "file", fullPath = currentPath, name = file}
            end
        end
    end
    return resTable
end
local function removeDirectory(self, folder)
    for file in dir(folder) do
        local file_path = path(nil, folder, file)
        if file ~= "." and file ~= ".." then
            if attributes(file_path).mode == "file" then
                os.remove(file_path)
            elseif attributes(file_path).mode == "directory" then
                removeDirectory(nil, file_path)
            end
        end
    end
    rmdir(folder)
end
____exports.FileUtils = {
    closeFile = closeFile,
    escapeObjNameForPath = escapeObjNameForPath,
    exists = exists,
    isDir = isDir,
    getDirectoryContent = getDirectoryContent,
    makeDir = makeDir,
    openFileForWriting = openFileForWriting,
    path = path,
    readFile = readFile,
    removeDirectory = removeDirectory,
    writeLine = writeLine,
    writeBinaryFile = writeBinaryFile
}
return ____exports
