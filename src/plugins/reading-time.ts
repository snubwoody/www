import {toString} from "mdast-util-to-string";

// The average person reads about 200 words per minute
/**
 * The amount of words the average person reads per minute.
 */
export const WORDS_PER_MINUTE = 200;

export const readingTime = () => {
    return function (tree, { data }) {
        const textOnPage = toString(tree);
        // console.log(textOnPage);
        const words = splitWords(textOnPage);
        data.astro.frontmatter.minutesToRead = calculateReadingTime(words);
        console.log(data.astro.frontmatter);
    };
};

// TODO: add punctuation
export const splitWords = (text: string): string[] => {
    return text.split("\n")
        .flatMap((line) => line.split(" "))
        .filter((word) => word.length > 0);
};

export const calculateReadingTime = (words: string[]): number => {
    const minutesToRead = Math.round(words.length / WORDS_PER_MINUTE);
    if (minutesToRead < 1) {
        return 1;
    }
    return minutesToRead;
};


