// use.js
const { loadData } = require("./modules/loadData");
const { sortStringsIgnoreSpaces } = require("./modules/sortStrings");
const fsx = require("./modules/fsx");
const { API } = require("./contants");

async function main() {
    const url = API.JSONPLACEHOLDER_USERS;

    // 1) загрузка данных
    const state = loadData(url);

    console.log("Загрузка началась. isLoading =", state.isLoading);

    await state.done; // ждём завершения

    console.log("Загрузка завершена. isLoading =", state.isLoading);

    if (state.error) {
        console.error("Ошибка загрузки:", state.error.message);
        return;
    }

    const users = state.data; // массив users
    console.log("Пользователей получено:", users.length);

    // 2) берём ИМЕНА (name) и сортируем их
    const names = users.map((u) => u.name);
    const sortedNames = sortStringsIgnoreSpaces(names);

    // 3) чтобы emails соответствовали отсортированным names — отсортируем users тем же ключом
    const key = (s) => String(s).replace(/\s+/g, "").toLowerCase();
    const sortedUsers = [...users].sort((a, b) => key(a.name).localeCompare(key(b.name), "ru"));

    const emails = sortedUsers.map((u) => u.email);

    // 4) создаём users/ и пишем файлы
    await fsx.createFolder("users");

    await fsx.writeFile("users/names.txt", sortedNames.join("\n") + "\n");
    await fsx.writeFile("users/emails.txt", emails.join("\n") + "\n");

    console.log("Готово ✅ Созданы файлы:");
    console.log(" - users/names.txt");
    console.log(" - users/emails.txt");
}

main().catch((e) => console.error("Ошибка:", e));
