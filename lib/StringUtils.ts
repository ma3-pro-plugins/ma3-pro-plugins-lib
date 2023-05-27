// Don't import this from Utils to avoid an import loop
function nTimes(n: number, fn: (i: number) => void) {
    assert(n >= 1)
    for (let i = 1; i <= n; i++) {
        fn(i)
    }
}

/**
 *
 * @param str Removes spaces from beggining and end of string
 * @returns
 */
export function trimSpaces(str: string) {
    let start = 0
    let end = str.length

    for (let i = 0; i < str.length; i++) {
        if (str[i] !== ' ') {
            start = i
            break
        }
    }
    for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] !== ' ') {
            end = i + 1
            break
        }
    }
    return str.substring(start, end)
}

/**
 * Last index of
 * @param str a string to search in
 * @param search a single character
 * @returns 0-based index of the seach character
 */
export function lastIndexOf(str: string, search: string) {
    assert(
        search.length === 1,
        `lastIndexOf: search term must be a single character`
    )
    for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] === search) {
            return i
        }
    }
    return -1
}

function repeat(str: string, times: number) {
    let result = ''
    nTimes(times, () => {
        result += str
    })
    return result
}

export const StringUtils = {
    repeat,
}
