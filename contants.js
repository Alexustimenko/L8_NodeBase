const BCRYPT = {
    SALT_ROUNDS: 10,
    PASSWORDS: [
        "pass_01", "pass_02", "pass_03", "pass_04", "pass_05",
        "pass_06", "pass_07", "pass_08", "pass_09", "pass_10",
        "pass_11", "pass_12", "pass_13",
    ],
};


const API = {
    JSONPLACEHOLDER_USERS: "https://jsonplaceholder.typicode.com/users",
};


const FSX = {
    ALLOWED_EXT: [".txt", ".json", ".rtf"],
    SERVICE_NAMES: [
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
        ".env.production",
        ".env.development",
        ".env.domain",
    ],
};

module.exports = { BCRYPT, API, FSX };
