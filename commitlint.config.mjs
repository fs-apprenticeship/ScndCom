import tensePlugin from "commitlint-plugin-tense";

/*
 * NOTE: this borrows from commitlint, which really is meant to enforce
 * conventional commits, to develop a light warning system; i.e. none of these
 * rules are blocking, and it's not aimed at enforcing conventional commits.
 */

const Configuration = {
  plugins: [tensePlugin],
  rules: {
    "body-max-line-length": [1, "always", 72],
    "header-case": [1, "always", "sentence-case"],
    "header-full-stop": [1, "never"],
    "header-max-length": [1, "always", 72],
    "header-min-length": [1, "always", 0],
    "header-trim": [1, "always"],
    "tense/subject-tense": [
      1,
      "always",
      { allowedTenses: ["present-imperative"], firstOnly: true },
    ],
  },
};

export default Configuration;
