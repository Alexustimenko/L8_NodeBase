require("dotenv").config();

const os = require("os");


function showOSInfo() {
    console.log("=== ОС: основная информация ===");

    console.log("Платформа (platform):", os.platform());
    console.log("Архитектура (arch):", os.arch());

    console.log("Имя ПК (hostname):", os.hostname());
    console.log("Главная директория (homedir):", os.homedir());

    const freeGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    console.log("Свободная память:", freeGB, "GB");
    console.log("Всего памяти:", totalGB, "GB");


    console.log("\n--- Сетевые интерфейсы (networkInterfaces) ---");
    const nets = os.networkInterfaces();

    for (const name of Object.keys(nets)) {
        const addrs = nets[name] || [];
        addrs.forEach((addr) => {

            console.log(
                `${name} | ${addr.family} | ${addr.address} | internal=${addr.internal} | mac=${addr.mac}`
            );
        });
    }

    console.log("================================\n");
}


function checkFreeMemoryOver4GB() {
    const freeBytes = os.freemem();
    const freeGB = freeBytes / 1024 / 1024 / 1024;

    if (freeGB > 4) {
        console.log(`Свободной памяти больше 4GB: ${freeGB.toFixed(2)} GB`);
        return true;
    } else {
        console.log(`Свободной памяти НЕ больше 4GB: ${freeGB.toFixed(2)} GB`);
        return false;
    }
}


function showOSInfoIfAllowed() {
    const mode = (process.env.MODE || "").toLowerCase();

    if (mode === "admin") {
        console.log("Доступ разрешён (MODE=admin).");
        showOSInfo();
    } else {
        console.log(
            `Доступ запрещён. Сейчас MODE="${process.env.MODE}". Нужно MODE=admin`
        );
    }
}



