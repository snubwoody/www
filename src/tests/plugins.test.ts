import {test,expect} from "vitest";
import {calculateReadingTime, splitWords} from "../plugins/reading-time.mjs";

test("Split words", () => {
    const words = splitWords("Three frogs flew through France\nThen died in a car crash");
    expect(words).toHaveLength(11);
});

test("Calculate reading time", () => {
    let text = "";
    for (let i = 0; i < 200; i++) {
        text += "Hi ";
    }
    const words = splitWords(text);
    const time = calculateReadingTime(words);
    expect(time).toBe(1);
});

test("Round up reading time", () => {
    let text = "";
    for (let i = 0; i < 300; i++) {
        text += "Hi ";
    }
    const words = splitWords(text);
    const time = calculateReadingTime(words);
    expect(time).toBe(2);
});

test("Cap reading time to 1", () => {
    let text = "";
    for (let i = 0; i < 50; i++) {
        text += "Hi ";
    }
    const words = splitWords(text);
    const time = calculateReadingTime(words);
    expect(time).toBe(1);
});

test("Split space seperated words", () => {
    const words = splitWords("Three frogs flew through France");
    expect(words).toHaveLength(5);
});

test("Trim spaces", () => {
    const words = splitWords("Three frogs     flew through France");
    expect(words).toHaveLength(5);
});

test("Split new line seperated words", () => {
    const words = splitWords("People\nin\nparis");
    expect(words).toHaveLength(3);
});
