import uglify from "rollup-plugin-uglify";
import eslint from "rollup-plugin-eslint";
import scss from "rollup-plugin-scss";


export default {
    input: "src/js/main.js",
    output: {
        file: "dist/bundle.js",
        format: "iife",
        sourceMap: "inline"
    },
    plugins: [
        uglify(),
        eslint({
            exclude: "./**/*.css"
        }),
        scss({
            output: "dist/bundle.css"
        })
    ]
};