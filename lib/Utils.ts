/**
 * And identity function to do type checking on object literals.
 */
export function typed<T>(x: T): T {
    return x
}

export function isInteger(s: string) {
    return tonumber(s) !== null
}

export function withDefault<T>(value: T | undefined, defaultValue: T): T {
    return value === undefined ? defaultValue : value
}

export function ifDef<T>(x: T | undefined, fn: (x: T) => any) {
    return x === undefined ? undefined : fn(x)
}

export function applyObjProps<T>(obj: T, props: Partial<T>) {
    for (let key of objectKeys(props)) {
        (obj as any)[key] = props[key]
    }
    return obj
}

export function applyObjPropsWithDefaults<T extends {}>(obj: T, defaults: Partial<T>, props: Partial<T>) {
    applyObjProps(obj, defaults)
    applyObjProps(obj, props)
    return obj
}

export function objectValues<T>(t: { [K in any]?: T }): T[]
export function objectValues<T>(t: Record<any, T>): T[] {
    const values: T[] = []
    for (let [_k, v] of pairs(t)) {
        values.push(v)
    }
    return values
}


export function objectKeys<K extends string | symbol | number>(t: { [J in K]?: any }): K[] {
    const keys: K[] = []
    for (let [k, _v] of pairs(t)) {
        keys.push(k)
    }
    return keys
}

export const objectEntries = pairs

export function isEmptyObject(obj: object) {
    return objectKeys(obj).length === 0
}

export function objectNumOfItems<T>(t: object): number {
    return objectKeys(t).length
}

export function toString(arr: any[]) {
    return `[${arr.join(",")}]`
}

export function isUndefined(x: any) {
    return x === undefined
}

export function isDefined(x: any) {
    return x !== undefined
}

/**
 * Creates an array with ascending integer numbers (interval 1)
 * @param start start number (including)
 * @param end end number (including)
 * @returns 
 */
export function series(start: number, end: number) {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)

}

/**
 * Run given function n times
 * @param fn function receives 1-based index 
 */
export function nTimes(n: number, fn: (i: number) => void) {
    assert(n >= 1)
    for (let i = 1; i <= n; i++) {
        fn(i)
    }
}

/**
 * Find the first (lowest) integer number,starting from 1, that is not in the given array.
 */
export function findFirstAvailableNumber(sortedNumbers: number[]) {
    if (sortedNumbers.length === 0) {
        return 1
    }
    let lastNumber = sortedNumbers[0]
    for (let n of sortedNumbers) {
        if (lastNumber !== undefined && n > lastNumber + 1) {
            return lastNumber + 1
        }
        lastNumber = n
    }
    return lastNumber + 1
}


export function arrayMove(arr: any[], oldIndex: number, newIndex: number, count: number = 1) {
    if (newIndex + count >= arr.length) {
        let k = newIndex + count - arr.length + 1;
        while (k-- > 0) {
            arr.push(undefined);
        }
    }
    arr.splice(newIndex, 0, ...arr.splice(oldIndex, count));
};


export function compareWithUndefined<T>(a: T, b: T, getCondition: (x: T) => number | undefined) {
    const aValue = getCondition(a)
    const bValue = getCondition(b)
    if (aValue === undefined && bValue === undefined) {
        return 0
    }

    if (aValue === undefined) {
        return -1
    }

    if (bValue === undefined) {
        return 1
    }

    return aValue - bValue

}



