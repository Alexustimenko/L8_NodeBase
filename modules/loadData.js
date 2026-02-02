const https = require("https");

function fetchJson(url) {

    if (typeof fetch === "function") {
        return fetch(url).then(async (r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
            return await r.json();
        });
    }


    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let raw = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (raw += chunk));
                res.on("end", () => {
                    try {
                        if (res.statusCode < 200 || res.statusCode >= 300) {
                            return reject(new Error(`HTTP ${res.statusCode}`));
                        }
                        resolve(JSON.parse(raw));
                    } catch (e) {
                        reject(e);
                    }
                });
            })
            .on("error", reject);
    });
}

/**
 * Функция загрузки данных.
 * Возвращает state-объект: { data: [], isLoading: true|false, error: Error|null }
 * Пока грузим -> isLoading=true. После -> false.
 * Чтобы дождаться завершения: await state.done
 */
function loadData(url) {
    const state = {
        data: [],
        isLoading: true,
        error: null,
        done: null,
    };

    state.done = (async () => {
        try {
            const json = await fetchJson(url);
            state.data = Array.isArray(json) ? json : [json];
            state.error = null;
        } catch (err) {
            state.data = [];
            state.error = err;
        } finally {
            state.isLoading = false;
        }
        return state;
    })();

    return state;
}

module.exports = { loadData };
