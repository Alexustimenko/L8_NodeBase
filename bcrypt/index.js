const bcrypt = require("bcrypt");


console.log("Текущий режим приложения MODE =", process.env.MODE);

const PASSWORDS = [
    "pass_01", "pass_02", "pass_03", "pass_04", "pass_05",
    "pass_06", "pass_07", "pass_08", "pass_09", "pass_10",
    "pass_11", "pass_12", "pass_13",
];

const SALT_ROUNDS = 10;

function nowNs() {
    return process.hrtime.bigint();
}
function nsToMs(ns) {
    return Number(ns) / 1e6;
}

async function hashOne(pwd, idx) {
    const start = nowNs();
    await bcrypt.hash(pwd, SALT_ROUNDS);
    const end = nowNs();

    const ms = nsToMs(end - start);
    console.log(`Пароль #${String(idx).padStart(2, "0")} | ${ms.toFixed(2)} ms`);
    return ms;
}

async function main() {
    console.log("\n=== bcrypt: 13 паролей одновременно ===");


    const tasks = PASSWORDS.map((pwd, i) => hashOne(pwd, i + 1));
    const times = await Promise.all(tasks);

    const avg = times.reduce((s, v) => s + v, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log("\nИтоги:");
    console.log(`MIN: ${min.toFixed(2)} ms`);
    console.log(`AVG: ${avg.toFixed(2)} ms`);
    console.log(`MAX: ${max.toFixed(2)} ms`);
}

main().catch((err) => console.error("Ошибка:", err));

//Обычно зависит от количества «кругов/циклов» шифрования
//bcrypt.hash — CPU-затратная операция. В Node.js она выполняется НЕ в основном потоке,
//  а в пуле потоков libuv (UV_THREADPOOL_SIZE). По умолчанию пул обычно  4 потока.
//Когда мы запускаем 13 хеширований "одновременно":
//- первые ~4 реально начинают вычисляться сразу (в 4 потоках),
//- остальные становятся в очередь и ждут освобождения потока,
//поэтому время отдельных паролей получается разным и часто больше:
//в него входит ожидание очереди + само вычисление.
//Также значения зависят от:
//- загрузки процессора другими программами,
// - планировщика ОС,
//- параметра SALT_ROUNDS (чем больше - тем дольше)