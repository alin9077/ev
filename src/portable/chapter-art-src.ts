/* Portable export inlines the artwork so index.html needs no other file. */
import { art } from "./data";
export const artSrc = (name: string) => art()[name];
