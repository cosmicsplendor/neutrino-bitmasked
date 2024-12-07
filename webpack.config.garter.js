const path = require("path")
const cwd = process.cwd()
module.exports = {
    entry: ["/lib/polyfills.js", "/src/index.js"],
    output: {
        filename: "script.js",
        path: path.join(cwd, "dist-garter")
    },
    mode: "production",
    target: [ "web", "es5" ],
    resolve: {
        alias: {
            // lib alias
            "@lib": path.join(cwd, "./lib"),
            "@utils": path.join(cwd, "./lib/utils"),
            "@components": path.join(cwd, "./lib/components"),
            // source alias
            "@root": path.join(cwd, "./src"),
            "@assets": path.join(cwd, "./src/assets"),
            "@config": path.join(cwd, "./src/config/garter"),
            "@entities": path.join(cwd, "./src/entities"),
            "@screens": path.join(cwd, "./src/screens"),
        }
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|mp3|ogg|wav|cson|bson)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        outputPath: "assets",
                        esModule: false
                    }
                }
            },
            {
                test: /.js$/,
                exclude: "/node_modules",
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: [ "@babel/plugin-proposal-class-properties", "@babel/plugin-transform-arrow-functions" ],
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    modules: false
                                }
                            ]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true,
                            import: true
                        }
                    }
                ]
            }
        ]
    },
}