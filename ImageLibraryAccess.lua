local ____lualib = require("lualib_bundle")
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__SourceMapTraceBack = ____lualib.__TS__SourceMapTraceBack
__TS__SourceMapTraceBack(debug.getinfo(1).short_src, {["6"] = 2,["7"] = 2,["8"] = 3,["9"] = 3,["10"] = 3,["11"] = 4,["12"] = 4,["18"] = 19,["19"] = 21,["20"] = 21,["21"] = 21,["22"] = 21,["23"] = 23,["24"] = 24,["25"] = 23,["26"] = 27,["27"] = 28,["28"] = 28,["29"] = 28,["30"] = 29,["31"] = 29,["32"] = 29,["33"] = 29,["34"] = 30,["35"] = 30,["36"] = 30,["37"] = 30,["38"] = 28,["39"] = 28,["40"] = 32,["41"] = 27,["42"] = 35,["43"] = 36,["44"] = 37,["45"] = 38,["46"] = 39,["47"] = 43,["48"] = 44,["49"] = 45,["50"] = 46,["51"] = 47,["52"] = 48,["54"] = 38,["55"] = 52,["56"] = 35,["57"] = 55,["58"] = 56,["59"] = 57,["61"] = 59,["63"] = 55,["64"] = 63,["65"] = 63,["66"] = 63,["67"] = 63,["68"] = 67,["69"] = 68,["70"] = 69,["71"] = 70,["72"] = 71,["73"] = 72,["75"] = 74,["77"] = 63,["78"] = 63,["79"] = 19});
local ____exports = {}
local ____XmlUtils = require("lib.XmlUtils")
local XmlUtils = ____XmlUtils.XmlUtils
local ____FileUtils = require("FileUtils")
local FileUtils = ____FileUtils.FileUtils
local removeDirectory = ____FileUtils.removeDirectory
local ____base64Codec = require("base64Codec")
local decode = ____base64Codec.decode
--- Craete Image Importer
-- Runs the "UpdateContent" command which makes MA3 generate XML file for each image in the image library.
-- Then resolves which XML belongs to which image file.
-- 
-- @returns An Importer that can be used to import images by their original file name.
function ____exports.ImageLibraryAccess(self, pluginId, log)
    local imageLibraryPath = FileUtils:path(
        GetPath(Enums.PathType.ImageLibrary),
        pluginId
    )
    local function getImageFileName(self, originalFileName)
        return (pluginId .. "_") .. originalFileName
    end
    local function writeToImageLibrary(self, images)
        __TS__ArrayForEach(
            images,
            function(____, image)
                local path = FileUtils:path(
                    imageLibraryPath,
                    getImageFileName(nil, image.fileName)
                )
                FileUtils:writeBinaryFile(
                    path,
                    decode(image.sourceBase64)
                )
            end
        )
        Cmd("UpdateContent image \"Images\"")
    end
    local function indexLibraryFile(self)
        local files = FileUtils:getDirectoryContent(imageLibraryPath)
        local xmlFileNameByImageFileName = {}
        files:forEach(function(____, file)
            if file.name:endsWith(".png.xml") then
                local content = FileUtils:readFile(file.fullPath)
                local presetsXmlNode = XmlUtils:parseXml(content)
                local root = presetsXmlNode[1]
                local userImageNode = root[0]
                local imageFileName = userImageNode.xarg.FileName
                xmlFileNameByImageFileName[imageFileName] = file.name
            end
        end)
        return xmlFileNameByImageFileName
    end
    local function deleteAllImages(self)
        if FileUtils:exists(imageLibraryPath) and FileUtils:isDir(imageLibraryPath) then
            removeDirectory(nil, imageLibraryPath)
        else
            log:warn("deleteAllImages: The plugin's Image library folder was aobut to be deleted, but it didn't exist. Folder path = " .. imageLibraryPath)
        end
    end
    return {
        deleteAllImages = deleteAllImages,
        imageLibraryPath = imageLibraryPath,
        writeToImageLibrary = writeToImageLibrary,
        importImages = function(____, images)
            local xmlFileNameByImageFileName = indexLibraryFile(nil)
            for ____, image in ipairs(images) do
                local xmlFileName = xmlFileNameByImageFileName[getImageFileName(nil, image.imageFileName)]
                if xmlFileName == nil then
                    error((("Import " .. image.imageFileName) .. " failed. a corresponding XML file was not found under ") .. imageLibraryPath)
                end
                Cmd(((((("Import Image \"Images\"." .. tostring(image.targetIndex)) .. " /File \"") .. xmlFileName) .. "\" /Path \"") .. imageLibraryPath) .. "\" /nc")
            end
        end
    }
end
return ____exports
