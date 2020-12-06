---
id: install
title: Installation
slug: /
---

## 1. Install the shroom package

To install shroom in your project, use the following command.

```
npm install @jankuss/shroom pixi.js
```

## 2. Dump assets from external variables into your project

```
npm install -g @jankuss/shroom
shroom dump --url https://www.habbo.com/gamedata/external_variables/326b0a1abf9e2571d541ac05e6eb3173b83bddea --location ./public/resources
```

You will need to serve the created `resources` folder with a http server, so shroom can access the required assets.
