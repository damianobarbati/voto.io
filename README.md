# voto.io

Make your voice heard.  
Soon (but not yet) available [here](https://votoio.duckdns.org).  
**This project is used to experiment with AI-driven development workflows and is 100% generated using AI.** 

## Development

Requirements:
- `fnm` (eg: `brew install fnm`)
- add `eval "$(fnm env --use-on-cd)"` into your `~/.zprofile` or `~/.profile`

Setup:
```sh
fnm install # nodejs from .nvmrc
npm install -g corepack
corepack enable # package manager from package.json
corepack install # package manager from package.json
pnpm install # install deps
export $(grep -v '^#' .env | xargs) # load-scenarios env vars
pnpm env:down # remove docker containers
pnpm env:up # start docker containers
pnpm -F api db:migrate # run migrations
pnpm -F api db:seed # seed db
```

Run:
```sh
pnpm -F api start:dev
pnpm -F webapp build:dev
```

Test:
```sh
pnpm -F api test
pnpm -F webapp test
```

Linting and typechecking:
```sh
pnpm lint
pnpm tsc
```

To run with https locally:
```sh
npx ngrok start --all --config ngrok.yml --authtoken <authtoken>
```

## NFRs

Run e2e testing:
```sh
pnpm -F e2e test
```

Run load testing:
```sh
pnpm -F api test:load-scenarios
```

You can prefix with `DEBUG=http` to log every HTTP request being issued.
Load testing should run on two dedicated runners with fixed CPU and memory limits/quotas for predictable results.  
The load generator should run separately from the API host, otherwise Artillery competes with the service for CPU and network.  