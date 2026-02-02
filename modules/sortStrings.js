function normalize(str) {
    return String(str).replace(/\s+/g, "").toLowerCase();
}

/**
 * @param {string[]} lines массив строк
 * @param {object} [opts]
 * @param {string} [opts.locale] локаль для сортировки
 * @returns {string[]} новый отсортированный массив
 */
function sortStringsIgnoreSpaces(lines, opts = {}) {
    const { locale = "ru" } = opts;
    const collator = new Intl.Collator(locale, { sensitivity: "base" });

    return [...lines].sort((a, b) => collator.compare(normalize(a), normalize(b)));
}

module.exports = { sortStringsIgnoreSpaces };
