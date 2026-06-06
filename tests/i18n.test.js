/**
 * Pruebas unitarias para el módulo de internacionalización (src/i18n.js)
 */

const { translations, getAvailableLanguages, setLanguage, getCurrentLanguage, t, getTextDirection } = require("../src/i18n.js");

describe("translations", () => {
    test("debe tener al menos 20 idiomas", () => {
        expect(Object.keys(translations).length).toBeGreaterThanOrEqual(20);
    });

    test("cada idioma debe tener name, native, dir y ui", () => {
        for (const [code, data] of Object.entries(translations)) {
            expect(data).toHaveProperty("name");
            expect(data).toHaveProperty("native");
            expect(data).toHaveProperty("dir");
            expect(data).toHaveProperty("ui");
            expect(["ltr", "rtl"]).toContain(data.dir);
        }
    });

    test("cada idioma debe tener todas las claves UI requeridas", () => {
        const requiredKeys = ["title", "subtitle", "config", "plcType", "inputs", "outputs", "generate", "generatedCode", "copy", "download", "language", "aiMode", "footer"];
        for (const [code, data] of Object.entries(translations)) {
            for (const key of requiredKeys) {
                expect(data.ui).toHaveProperty(key);
            }
        }
    });

    test("el árabe debe tener dirección RTL", () => {
        expect(translations["ar"].dir).toBe("rtl");
    });

    test("idiomas LTR deben estar marcados correctamente", () => {
        expect(translations["en"].dir).toBe("ltr");
        expect(translations["es"].dir).toBe("ltr");
        expect(translations["zh"].dir).toBe("ltr");
    });
});

describe("getAvailableLanguages", () => {
    test("debe retornar array con todos los idiomas", () => {
        const langs = getAvailableLanguages();
        expect(Array.isArray(langs)).toBe(true);
        expect(langs.length).toBe(Object.keys(translations).length);
    });

    test("cada elemento debe tener code, name, native", () => {
        const langs = getAvailableLanguages();
        for (const lang of langs) {
            expect(lang).toHaveProperty("code");
            expect(lang).toHaveProperty("name");
            expect(lang).toHaveProperty("native");
        }
    });
});

describe("setLanguage / getCurrentLanguage", () => {
    afterEach(() => { setLanguage("es"); });

    test("debe cambiar idioma exitosamente", () => {
        expect(setLanguage("en")).toBe(true);
        expect(getCurrentLanguage()).toBe("en");
    });

    test("debe retornar false para idioma no soportado", () => {
        expect(setLanguage("xx")).toBe(false);
        expect(getCurrentLanguage()).toBe("es");
    });

    test("debe mantener el idioma anterior si falla", () => {
        setLanguage("fr");
        setLanguage("invalid");
        expect(getCurrentLanguage()).toBe("fr");
    });
});

describe("t (función de traducción)", () => {
    afterEach(() => { setLanguage("es"); });

    test("debe traducir clave simple", () => {
        expect(t("title")).toBe("PLC Code Generator Pro");
    });

    test("debe traducir clave anidada", () => {
        expect(t("notifications.success")).toBe("Código PLC generado con éxito");
    });

    test("debe cambiar al cambiar idioma", () => {
        setLanguage("en");
        expect(t("notifications.success")).toBe("PLC code generated successfully");
    });

    test("debe retornar la clave si no existe", () => {
        expect(t("nonexistent.key.path")).toBe("nonexistent.key.path");
    });

    test("debe funcionar con todos los idiomas sin errores", () => {
        for (const code of Object.keys(translations)) {
            setLanguage(code);
            expect(t("title")).toBeTruthy();
            expect(t("generate")).toBeTruthy();
        }
    });
});

describe("getTextDirection", () => {
    afterEach(() => { setLanguage("es"); });

    test("debe retornar ltr para español", () => {
        expect(getTextDirection()).toBe("ltr");
    });

    test("debe retornar rtl para árabe", () => {
        setLanguage("ar");
        expect(getTextDirection()).toBe("rtl");
    });
});
