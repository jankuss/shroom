module.exports = {
    babelrcRoots: ["."],
    presets: [
      "@babel/preset-typescript",
      "@babel/preset-react",
      [
        "@babel/preset-env",
        {
          modules: false,
          targets: {
            chrome: "72",
          },
        },
      ],
    ],
    plugins: [
      "@babel/plugin-proposal-optional-chaining",
      "@babel/plugin-proposal-nullish-coalescing-operator",
      "@babel/plugin-proposal-numeric-separator",
      "@babel/plugin-proposal-class-properties"
    ],
}; 