import { toString as mdToString } from "mdast-util-to-string";

/**
 * @typedef {import('mdast').Root} Root
 */

/**
 * The amount of words the average person reads per minute.
 */
export const WORDS_PER_MINUTE = 200;

export default function plugin() {
    /**
     * @param {import('mdast').Root} tree
     */
    return (tree, file) => {
        const words = splitWords(mdToString(tree));
        const minutes = readingTime(words);
        file.data.astro.frontmatter.wordCount = words.length;
        file.data.astro.frontmatter.minutesToRead = minutes;
    };
}

/**
 *
 * Splits a string of text into an array of words.
 *
 * @param {string}text
 * @returns {string[]} An array of words
 */
export const splitWords = (text) => {
    return text
        .split("\n")
        .flatMap((line) => line.split(" "))
        .filter((word) => word.length > 0);
};

/**
 * Calculates the reading time in minutes.
 *
 * @param {string[]}words
 * @returns {number} The reading time (in minutes).
 */
export const readingTime = (words) => {
    const minutesToRead = Math.round(words.length / WORDS_PER_MINUTE);
    return Math.max(minutesToRead, 1);
};
