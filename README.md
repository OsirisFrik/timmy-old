# Timmy
![build](https://travis-ci.com/OsirisFrik/timmy.svg?branch=master)
This is a discord bot to random features...

## Install

```bash
yarn install
## or
npm install
```
## ENV

```env
PORT =
NODE_ENV =
DATABASE =
BUCKET =
GOOGLE_APPLICATION_CREDENTIALS =
DISCORD =
```

## Run

### dev

```bash
yarn dev
## or
npm run dev
```

### prod

```bash
yarn start
## or
npm start
```

### test

```bash
yarn test
## or
npm run test
```

## Add feature

Create file in `bot/<name>.ts`

### structure

```ts
import MainBot from './main'

class ModuleName extends MainBot {
  constructor(client) {
    this.client = client
    this.commands = [String]
  }

  onCommand(message) {
    ...
  }
}

```
