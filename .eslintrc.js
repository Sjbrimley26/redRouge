module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "parser": "babel-eslint",
    "extends": [
      "eslint:recommended",
      "prettier"
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": [
      "prettier"
    ],
    "rules": {
        "indent": [
            "error",
            2,
            {
              "SwitchCase": 1
            }
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": "off",
        "prettier/prettier": "error"
    }
};