import ini from "ini";

function preprocessIni(input: string): string {
    return input.replace(
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
export type IniValue = IniBaseValue | IniBaseValue[] | Record<string, IniBaseValue>;

/**
 * INI file structure.
 */
export interface Ini {
    [key: string]: IniValue;
}

export function parseIni(file: string): Ini {
    return ini.parse(preprocessIni(file));
}
