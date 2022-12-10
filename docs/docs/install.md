---
id: install
title: Installation
slug: /
---

### 1. Install the shroom package

To install shroom in your project, use the following command.

```
npm install @jankuss/shroom pixi.js
```

If you are using `yarn`, you can use

```
yarn add @jankuss/shroom pixi.js
```

### 2. Dump assets into your project

Run the following commands to dump the required assets into your project directory. This will take some time.
The `--url` option specifies the url to the external variables to use. The `--location` option specifies the location where the assets should get dumped into.
You can adjust both as needed.

```
npm install -g @jankuss/shroom
shroom dump --url https://www.habbo.com/gamedata/external_variables/326b0a1abf9e2571d541ac05e6eb3173b83bddea --location ./public/resources
```

You will need to serve the created `resources` folder with a http server, so shroom can access the required assets.

### 4. Create the Shroom instance

Lastly, in your code, import and initialize the Shroom instance.

```ts
import * as PIXI from "pixi.js";
import { Shroom } from "@jankuss/shroom";

const view = document.querySelector("#root") as HTMLCanvasElement;
const application = new PIXI.Application({ view });

// Assuming the resources are available under http://localhost:8080/resources
const shroom = Shroom.create({ application, resourcePath: "./resources" });
```

Now, you are fully ready to use shroom.
Check out the [Guides](guides/create-room.md) section to learn how to use shroom.

Also, take a look at the [example project](https://github.com/jankuss/shroom/tree/master/example) in the shroom repository for a basic project depending on shroom.
You can use it as a boilerplate for your own.
