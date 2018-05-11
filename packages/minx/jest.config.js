module.exports = {
  "moduleFileExtensions": [
    "js",
    "ts",
    "json"
  ],
  "transform": {
    "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
    ".*\\.(ts)$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/dist/$1"
  },
  "testRegex": "(/test/.*|(\\.|/)(test|spec))\\.jsx?$"
}