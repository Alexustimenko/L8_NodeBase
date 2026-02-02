const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

const PROJECT_ROOT = path.resolve(__dirname, "..");


const SERVICE_NAMES = new Set([
    "node_modules",
    ".git",
    ".idea",
    ".vscode",
    ".DS_Store",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".env",
    ".env.local",
    ".env.example",
]);

const ALLOWED_EXT = new Set([".txt", ".json", ".rtf"]);


function resolveInProject(p) {
    const abs = path.resolve(PROJECT_ROOT, p);
    if (!abs.startsWith(PROJECT_ROOT)) {
        throw new Error("Запрещён выход за пределы проекта");
    }
    return abs;
}

function isServicePath(absPath) {
    const rel = path.relative(PROJECT_ROOT, absPath);
    const parts = rel.split(path.sep);

    return parts.some((p) => SERVICE_NAMES.has(p));
}

function hasAllowedExt(absPath) {
    return ALLOWED_EXT.has(path.extname(absPath).toLowerCase());
}

function cleanNoiseText(text) {

    return text.toLowerCase().replace(/\d+/g, "");
}


function writeFileSyncRel(relFilePath, content) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
}

function readFileSyncRel(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    return fs.readFileSync(abs, "utf8");
}

function replaceFileSyncRel(relFilePath, newContent) {

    return writeFileSyncRel(relFilePath, newContent);
}

function clearFileSyncRel(relFilePath) {

    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    fs.writeFileSync(abs, "", "utf8");
}

function cleanNoiseInFileSyncRel(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    const text = fs.readFileSync(abs, "utf8");
    const cleaned = cleanNoiseText(text);
    fs.writeFileSync(abs, cleaned, "utf8");
}

function copyFileSyncRel(fromRel, toRel) {
    const fromAbs = resolveInProject(fromRel);
    const toAbs = resolveInProject(toRel);
    if (!hasAllowedExt(fromAbs) || !hasAllowedExt(toAbs)) {
        throw new Error("Недопустимое расширение файла");
    }
    fs.mkdirSync(path.dirname(toAbs), { recursive: true });
    fs.copyFileSync(fromAbs, toAbs);
}

function createFolderSyncRel(relDirPath) {
    const abs = resolveInProject(relDirPath);
    fs.mkdirSync(abs, { recursive: true });
}

function removeFolderSyncRel(relDirPath) {
    const abs = resolveInProject(relDirPath);
    
    fs.rmSync(abs, { recursive: true, force: true });
}

function listAllProjectFilesSync() {
    const result = [];

    function walk(dirAbs) {
        const items = fs.readdirSync(dirAbs, { withFileTypes: true });
        for (const it of items) {
            const abs = path.join(dirAbs, it.name);

            if (isServicePath(abs)) continue;

            if (it.isDirectory()) walk(abs);
            else result.push(abs);
        }
    }

    walk(PROJECT_ROOT);
    return result;
}

function wipeProjectSync() {

    function walk(dirAbs) {
        const items = fs.readdirSync(dirAbs, { withFileTypes: true });
        for (const it of items) {
            const abs = path.join(dirAbs, it.name);

            if (isServicePath(abs)) continue;

            if (it.isDirectory()) {

                walk(abs);

                fs.rmSync(abs, { recursive: true, force: true });
            } else {
                fs.rmSync(abs, { force: true });
            }
        }
    }

    walk(PROJECT_ROOT);
}


async function writeFileAsyncRel(relFilePath, content) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, content, "utf8");
}

async function readFileAsyncRel(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    return await fsp.readFile(abs, "utf8");
}

async function replaceFileAsyncRel(relFilePath, newContent) {
    return writeFileAsyncRel(relFilePath, newContent);
}

async function clearFileAsyncRel(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    await fsp.writeFile(abs, "", "utf8");
}

async function cleanNoiseInFileAsyncRel(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    const text = await fsp.readFile(abs, "utf8");
    const cleaned = cleanNoiseText(text);
    await fsp.writeFile(abs, cleaned, "utf8");
}

async function copyFileAsyncRel(fromRel, toRel) {
    const fromAbs = resolveInProject(fromRel);
    const toAbs = resolveInProject(toRel);
    if (!hasAllowedExt(fromAbs) || !hasAllowedExt(toAbs)) {
        throw new Error("Недопустимое расширение файла");
    }
    await fsp.mkdir(path.dirname(toAbs), { recursive: true });
    await fsp.copyFile(fromAbs, toAbs);
}

async function createFolderAsyncRel(relDirPath) {
    const abs = resolveInProject(relDirPath);
    await fsp.mkdir(abs, { recursive: true });
}

async function removeFolderAsyncRel(relDirPath) {
    const abs = resolveInProject(relDirPath);
    await fsp.rm(abs, { recursive: true, force: true });
}

async function listAllProjectFilesAsync() {
    const result = [];

    async function walk(dirAbs) {
        const items = await fsp.readdir(dirAbs, { withFileTypes: true });
        for (const it of items) {
            const abs = path.join(dirAbs, it.name);

            if (isServicePath(abs)) continue;

            if (it.isDirectory()) await walk(abs);
            else result.push(abs);
        }
    }

    await walk(PROJECT_ROOT);
    return result;
}

async function wipeProjectAsync() {
    async function walk(dirAbs) {
        const items = await fsp.readdir(dirAbs, { withFileTypes: true });
        for (const it of items) {
            const abs = path.join(dirAbs, it.name);

            if (isServicePath(abs)) continue;

            if (it.isDirectory()) {
                await walk(abs);
                await fsp.rm(abs, { recursive: true, force: true });
            } else {
                await fsp.rm(abs, { force: true });
            }
        }
    }

    await walk(PROJECT_ROOT);
}


module.exports = {
    sync: {
        writeFile: writeFileSyncRel,
        readFile: readFileSyncRel,
        replaceFile: replaceFileSyncRel,
        clearFile: clearFileSyncRel,
        cleanNoise: cleanNoiseInFileSyncRel,
        copyFile: copyFileSyncRel,
        createFolder: createFolderSyncRel,
        removeFolder: removeFolderSyncRel,
        listProjectFiles: listAllProjectFilesSync,
        wipeProject: wipeProjectSync,
    },
    async: {
        writeFile: writeFileAsyncRel,
        readFile: readFileAsyncRel,
        replaceFile: replaceFileAsyncRel,
        clearFile: clearFileAsyncRel,
        cleanNoise: cleanNoiseInFileAsyncRel,
        copyFile: copyFileAsyncRel,
        createFolder: createFolderAsyncRel,
        removeFolder: removeFolderAsyncRel,
        listProjectFiles: listAllProjectFilesAsync,
        wipeProject: wipeProjectAsync,
    },
};
