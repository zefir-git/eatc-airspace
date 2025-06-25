import ini from "ini";

function preprocessIni(input: string): string {
    return input.replace(/\r\n|\r/g, '\n')
        .replace(/^#.*\n/gm, "")
        .replace(
        /^(\w+)\s*=\s*\n((?:[ \t].*\n?)+)/gm,
        (_, key, block) =>
            block
                .trimEnd()
                .split('\n')
                .map((line: string) => `${key}[] = ${line.trim()}`)
                .join('\n') + "\n"
    );
}

export type IniBaseValue = string | number | boolean;
export type IniValue = IniBaseValue | IniBaseValue[];

/**
 * INI file structure.
 */
export interface Ini {
    [key: string]: Record<string, IniValue>;
}

export function parseIni(file: string): Ini {
    const d = ini.parse(preprocessIni(file));
    return Object.fromEntries(
        Object.entries(d).map(([key, value]) => [
            key,
            Object.fromEntries(
                Object.entries(value).map(([key, value]) => {
                    if (typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value)) {
                        const n = Number.parseFloat(value);
                        if (Number.isNaN(n)) return [key, value] as [string, IniValue];
                        return [key, n] as [string, number];
                    }
                    return [key, value] as [string, IniValue];
                })
            )
        ])
    );
}
