import { attributes, dir, mkdir, rmdir } from "lfs"

const PATH_SEPERATOR = "/"

function makeDir(path: string) {
    return mkdir(path)
}

function path(...pathParts: string[]) {
    return pathParts.join(PATH_SEPERATOR)
}

function readFile(filePath: string): string | undefined {
    const temp = io.input()
    io.input(filePath)
    const fileContent = io.read<'a'>("a")
    io.input().close()
    io.input(temp)
    return fileContent
}

function openFileForWriting(fileName: string): LuaFile {
    const [fileWrapper] = assert(io.open(fileName, "w"));
    const [file] = fileWrapper as any
    return file
}

function writeBinaryFile(fileName: string, data: string): void {
    const [out] = io.open(fileName, "wb");
    if (out === undefined) {
        error(`Could not open file for binary writing: ${fileName}`)
    } else {
        const [_, err] = out.write(data)
        assert(err === undefined, `Could not write to file: ${err}`)
        assert(out.close())
    }
}

function writeLine(fp: LuaFile, line: string) {
    fp.write(line);
    fp.write("\n");
}

function closeFile(fp: LuaFile) {
    fp.flush();
    fp.close();
}

function escapeObjNameForPath(name: string) {
    return name.replace("/", "_")
}

export function escapeFileName(name: string) {
    return (name as any).gsub("[,'`]", "_")
}

export interface FileEntry {
    type: 'directory' | 'file'
    fullPath: string
    name: string
}

function exists(path: string) {
    return attributes(path) !== undefined
}

function isDir(path: string) {
    return attributes(path).mode === "directory"
}

/**
 * Get directory content
 * Taken from gma3_helpers.lua
 */
function getDirectoryContent(path: string): FileEntry[] {
    const resTable: FileEntry[] = []
    for (const file of dir(path)) {
        if (file != "." && file != "..") {
            const currentPath = path + GetPathSeparator() + file
            const attr = attributes(currentPath)
            assert(type(attr) == "table")
            if (attr.mode == "directory") {
                resTable.push({ type: "directory", fullPath: currentPath, name: file })
            } else {
                resTable.push({ type: "file", fullPath: currentPath, name: file })
            }
        }
    }
    return resTable;
}

function removeDirectory(folder: string) {
    for (let file of dir(folder)) {
        const file_path = path(folder, file)
        if (file !== "." && file !== "..") {
            if (attributes(file_path).mode === 'file') {
                os.remove(file_path)
            } else if (attributes(file_path).mode === 'directory') {
                removeDirectory(file_path)
            }
        }
    }
    rmdir(folder)
}

export const FileUtils = {
    closeFile,
    escapeObjNameForPath,
    exists,
    isDir,
    getDirectoryContent,
    makeDir,
    openFileForWriting,
    path,
    readFile,
    removeDirectory,
    writeLine,
    writeBinaryFile,
}
