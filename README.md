# nest-fgql

<a href="https://circleci.com/gh/mirco312312/nest-fgql" target="_blank"><img src="https://img.shields.io/circleci/build/github/mirco312312/nest-fgql/master" alt="CircleCI" /></a>

<img alt="npm (scoped)" src="https://img.shields.io/npm/v/@mirco312312/nest-fgql">
A fast and lightweight module to expose [GraphQL](https://graphql.org/) APIs in a [NestJS](https://nestjs.com) application.

## Description

This is intended to be a drop-in replacement for [@nestjs/graphql](https://github.com/nestjs/graphql) that offers improved runtime performance.

[Benchmarks](https://github.com/benawad/node-graphql-benchmarks) show that Apollo adds a noteable overhead regarding performance. Using [fastify](https://github.com/fastify/fastify) and [graphql-jit](https://github.com/zalando-incubator/graphql-jit) via [fastify-gql](https://github.com/mcollina/fastify-gql) performance is improved.

## Usage

### Requirements

Must first follow the [Performance (Fastify)
](https://docs.nestjs.com/techniques/performance) guide to setup [fastify](https://github.com/fastify/fastify).

### Install

```
yarn add @mirco312312/nest-fgql
```

### Code

```
import { Module } from '@nestjs/common';
import { FgqlModule } from '@mirco312312/nest-fgql';
// ... your other imports

@Module({
  imports: [
    // ... preceeding modules
    FgqlModule.forRoot({
      autoSchemaFile: true,
      // ... any other options
    }),
    // ... more modules
  ],
})
export class ApplicationModule {}
```

## Performance

Start the test scenario for an environment.

### @nestjs/graphql

```
git clone https://github.com/nestjs/graphql
cd graphql
npm i
npx ts-node tests/code-first/main.ts
```

### nest-fgql

```
git clone https://github.com/mirco312312/nest-fgql
cd nest-fgql
yarn
npx ts-node tests/code-first/main.ts
```

### Execute [autocannon](https://github.com/mcollina/autocannon)

```
autocannon -d 10 -c100 \
    -m POST \
    -H 'Content-Type: application/json' \
    -b '{"operationName":null,"variables":{},"query":"{\n  categories {\n    name\n    description\n    tags\n  }\n  recipes {\n    id\n    ingredients {\n      name\n    }\n    rating\n    averageRating\n  }\n}\n"}' \
    http://localhost:3000/graphql
```

### Results

MacBook Pro (16-inch, 2019)

- 2,4 GHz 8-Core Intel Core i9
- 64 GB 2667 MHz DDR4

#### @nestjs/graphql

```
Running 10s test @ http://localhost:3000/graphql
100 connections

┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬───────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max       │
├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼───────────┤
│ Latency │ 25 ms │ 29 ms │ 61 ms │ 67 ms │ 30.89 ms │ 8.83 ms │ 176.23 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴───────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
│ Req/Sec   │ 1613   │ 1613   │ 3429    │ 3579    │ 3183.2  │ 576.32 │ 1613   │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
│ Bytes/Sec │ 807 kB │ 807 kB │ 1.72 MB │ 1.79 MB │ 1.59 MB │ 288 kB │ 807 kB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴────────┴────────┘

Req/Bytes counts sampled once per second.

32k requests in 10.05s, 15.9 MB read
```

#### nest-fgql

```
Running 10s test @ http://localhost:3000/graphql
100 connections

┌─────────┬──────┬──────┬───────┬───────┬─────────┬─────────┬──────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg     │ Stdev   │ Max      │
├─────────┼──────┼──────┼───────┼───────┼─────────┼─────────┼──────────┤
│ Latency │ 7 ms │ 8 ms │ 12 ms │ 13 ms │ 8.94 ms │ 1.52 ms │ 29.08 ms │
└─────────┴──────┴──────┴───────┴───────┴─────────┴─────────┴──────────┘
┌───────────┬─────────┬─────────┬─────────┬────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%  │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 10327   │ 10327   │ 10591   │ 10935  │ 10607.2 │ 164.39  │ 10326   │
├───────────┼─────────┼─────────┼─────────┼────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 4.15 MB │ 4.15 MB │ 4.26 MB │ 4.4 MB │ 4.26 MB │ 66.2 kB │ 4.15 MB │
└───────────┴─────────┴─────────┴─────────┴────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

106k requests in 10.05s, 42.6 MB read
```

## Credits

Heavily based on [@nestjs/graphql](https://github.com/nestjs/graphql).
