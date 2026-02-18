const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { FSX } = require("../contants");

const SERVICE_NAMES = new Set(FSX.SERVICE_NAMES);
const ALLOWED_EXT = new Set(FSX.ALLOWED_EXT);

function projectRoot() {
    return process.cwd();
}

function resolveInProject(p) {
    const root = projectRoot();
    const abs = path.resolve(root, p);
    if (!abs.startsWith(root)) throw new Error("Запрещён выход за пределы проекта");
    return abs;
}

function isServicePath(absPath) {
    const rel = path.relative(projectRoot(), absPath);
    const parts = rel.split(path.sep);
    return parts.some((p) => SERVICE_NAMES.has(p));
}

function hasAllowedExt(absPath) {
    return ALLOWED_EXT.has(path.extname(absPath).toLowerCase());
}

function cleanNoiseText(text) {
    return String(text).toLowerCase().replace(/\d+/g, "");
}


async function writeFile(relFilePath, content) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, content, "utf8");
}

async function readFile(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    return await fsp.readFile(abs, "utf8");
}

async function replaceFile(relFilePath, newContent) {
    return writeFile(relFilePath, newContent);
}

async function clearFile(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    await fsp.writeFile(abs, "", "utf8");
}

async function cleanNoise(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    const text = await fsp.readFile(abs, "utf8");
    await fsp.writeFile(abs, cleanNoiseText(text), "utf8");
}

async function copyFile(fromRel, toRel) {
    const fromAbs = resolveInProject(fromRel);
    const toAbs = resolveInProject(toRel);
    if (!hasAllowedExt(fromAbs) || !hasAllowedExt(toAbs)) {
        throw new Error("Недопустимое расширение файла");
    }
    await fsp.mkdir(path.dirname(toAbs), { recursive: true });
    await fsp.copyFile(fromAbs, toAbs);
}

async function createFolder(relDirPath) {
    const abs = resolveInProject(relDirPath);
    await fsp.mkdir(abs, { recursive: true });
}

async function removeFolder(relDirPath) {
    const abs = resolveInProject(relDirPath);
    await fsp.rm(abs, { recursive: true, force: true });
}

async function listProjectFiles() {
    const root = projectRoot();
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

    await walk(root);
    return result;
}

async function wipeProject() {
    const root = projectRoot();

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

    await walk(root);
}


function writeFileSync(relFilePath, content) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
}

function readFileSync(relFilePath) {
    const abs = resolveInProject(relFilePath);
    if (!hasAllowedExt(abs)) throw new Error("Недопустимое расширение файла");
    return fs.readFileSync(abs, "utf8");
}

module.exports = {

    writeFile,
    readFile,
    replaceFile,
    clearFile,
    cleanNoise,
    copyFile,
    createFolder,
    removeFolder,
    listProjectFiles,
    wipeProject,


    writeFileSync,
    readFileSync,
};
