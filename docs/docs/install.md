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

### 2. Install `swftools` (http://www.swftools.org/download.html)

### 3. Dump assets from external variables into your project

```
npm install -g @jankuss/shroom
shroom dump --url https://www.habbo.com/gamedata/external_variables/326b0a1abf9e2571d541ac05e6eb3173b83bddea --location ./public/resources
```

You will need to serve the created `resources` folder with a http server, so shroom can access the required assets.

### 4. Create the Shroom instance

Lastly, in your code, import and initialize the Shroom instance.

```ts
import { Shroom } from "@jankuss/shroom";

// Assuming the resources are available under http://localhost:8080/resources
const shroom = Shroom.create({ application, resourcePath: "./resources" });
```

Now, you are fully ready to use shroom.
Check out the [Guides](create-room.md) section to learn how to use shroom properly.
