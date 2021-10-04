# install-peer

CLI library to install peer dependencies

[![Publish](https://github.com/sodaru/install-peer/actions/workflows/publish.to.npm.yml/badge.svg)](https://github.com/sodaru/install-peer/actions/workflows/publish.to.npm.yml)

> npm i [install-peer](http://www.npmjs.com/package/install-peer)

## Overview

NPM v6 does not install peer dependencies automnatically
instead it displays a warning , and asks developer to install the required peer dependencies

```
npm WARN @test/a@1.0.0 requires a peer of @test/d@^1.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @test/b@1.0.0 requires a peer of @test/g@^1.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @test/e@1.0.0 requires a peer of @test/p@^1.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @test/c@1.0.0 requires a peer of @test/j@^1.0.0 but none is installed. You must install peer dependencies yourself.
npm WARN @test/h@1.0.0 requires a peer of @test/y@^1.0.0 but none is installed. You must install peer dependencies yourself.
```

This CLI Tool parses this message and installs the peer dependencies recursivesly , till all peer dependencies are installed

## Install

```SH
npm i install-peer
```

## Usage

### through CLI

```
npx install-peer [dir]
```

if dir is omitted installs peer dependencies in current working directory

### through API

```TS
import { installAllPeerDependencies } from "install-peer";

const dir = process.argv[2] || process.cwd();

installAllPeerDependencies(dir)
  .then(() => {
    console.log("Done");
  })
  .catch(err => {
    console.error("Error Occurred");
    console.error(err);
  });

```

## Support

This project is a part of Open Source Intitiative from [Sodaru Technologies](https://sodaru.com)

Write an email to opensource@sodaru.com for queries on this project
