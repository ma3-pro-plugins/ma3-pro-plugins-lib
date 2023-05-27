import { FileUtils } from './FileUtils';
import { Logger } from './Logger';
import { XmlUtils } from './XmlUtils';
import { decode } from './base64Codec';

/**
 * These types fits the generated __images/index.ts from the buildPlugin.mjs script
 */
export type ImageData = { fileName: string; imageBase64: string };
export type BuiltInImages<ImageKey extends string> = { [key in ImageKey]: ImageData };

/**
 * Craete Image Importer
 * Runs the "UpdateContent" command which makes MA3 generate XML file for each image in the image library.
 * Then resolves which XML belongs to which image file.
 *
 * @param {string} pluginId an id used as a sub-folder name inside the image library
 * @returns An Importer that can be used to import images by their original file name.
 */
export function ImageLibraryUtils(pluginId: string, log: Logger) {
  const imageLibraryPath: string = FileUtils.path(GetPath(Enums.PathType.ImageLibrary), pluginId);

  function getImageFileName(originalFileName: string) {
    return `${pluginId}_${originalFileName}`;
  }

  function writeImageFiles(images: ImageData[]) {
    if (!FileUtils.exists(imageLibraryPath)) {
      FileUtils.makeDir(imageLibraryPath);
    }
    images.forEach((image) => {
      const path = FileUtils.path(imageLibraryPath, getImageFileName(image.fileName));
      FileUtils.writeBinaryFile(path, decode(image.imageBase64));
    });
    Cmd(`UpdateContent image "Images"`);
  }

  function indexLibraryFile() {
    const files = FileUtils.getDirectoryContent(imageLibraryPath);
    const xmlFileNameByImageFileName: Record<string, string> = {};
    files.forEach((file) => {
      if (file.name.endsWith('.png.xml')) {
        // This unfortunately yields nil
        // const imageXml = Import(file.fullPath)

        const content = FileUtils.readFile(file.fullPath);
        const presetsXmlNode = XmlUtils.parseXml(content!);
        const root = presetsXmlNode[1];
        const userImageNode = root[0];
        const imageFileName = userImageNode.xarg.FileName;
        xmlFileNameByImageFileName[imageFileName] = file.name;
      }
    });
    return xmlFileNameByImageFileName;
  }

  function deleteAllImages() {
    if (FileUtils.exists(imageLibraryPath) && FileUtils.isDir(imageLibraryPath)) {
      FileUtils.removeDirectory(imageLibraryPath);
    } else {
      log.warn(
        `deleteAllImages: The plugin's Image library folder was aobut to be deleted, but it didn't exist. Folder path = ${imageLibraryPath}`
      );
    }
  }

  function importImages(images: { imageFileName: string; targetIndex: number | string }[]) {
    const xmlFileNameByImageFileName = indexLibraryFile();
    for (let image of images) {
      const xmlFileName = xmlFileNameByImageFileName[getImageFileName(image.imageFileName)];
      if (xmlFileName === undefined) {
        error(`Import ${image.imageFileName} failed. a corresponding XML file was not found under ${imageLibraryPath}`);
      }
      Cmd(`Import Image "Images".${image.targetIndex} /File "${xmlFileName}" /Path "${imageLibraryPath}" /nc`);
    }
  }

  return {
    deleteAllImages,
    imageLibraryPath,
    importImages,
    writeImageFiles,
  };
}

export type ImageLibraryAccess = ReturnType<typeof ImageLibraryUtils>;
