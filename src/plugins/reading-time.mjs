import {toString} from "mdast-util-to-string";

// The average person reads about 200 words per minute
/**
 * The amount of words the average person reads per minute.
 */
export const WORDS_PER_MINUTE = 200;

export default function readingTime() {
    throw  "Failed 1";
    return function (tree, file) {
        throw  "Failed 2";
        const textOnPage = toString(tree);
        console.log(textOnPage);
        const words = splitWords(textOnPage);
        file.data.astro.frontmatter.minutesToRead = calculateReadingTime(words);
        console.log(calculateReadingTime(words));
    };
};

/**
 *
 * Splits a string of text into an array of words.
 * @param {string}text
 * @returns {string[]} An array of words
 */
export const splitWords = (text) => {
    return text.split("\n")
        .flatMap((line) => line.split(" "))
        .filter((word) => word.length > 0);
};

/**
 * Calculates the reading time in minutes.
 * @param {string[]}words
 * @returns {number} The reading time (in minutes).
 */
export const calculateReadingTime = (words) => {
    const minutesToRead = Math.round(words.length / WORDS_PER_MINUTE);
    if (minutesToRead < 1) {
        return 1;
    }
    return minutesToRead;
};


