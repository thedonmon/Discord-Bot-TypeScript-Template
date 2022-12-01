export const groupByToMap = <T, Q>(
    array: T[],
    predicate: (value: T, index: number, array: T[]) => Q
): Map<Q, T[]> =>
    array.reduce((map, value, index, array) => {
        const key = predicate(value, index, array);
        map.get(key)?.push(value) ?? map.set(key, [value]);
        return map;
    }, new Map<Q, T[]>());

export function groupBy<T>(
    array: T[],
    predicate: (value: T, index: number, array: T[]) => string
): { [key: string]: T[] } {
    return array.reduce((acc, value, index, array) => {
        (acc[predicate(value, index, array)] ||= []).push(value);
        return acc;
    }, {} as { [key: string]: T[] });
}
