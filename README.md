# voto.io

Poll and vote.

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
export $(grep -v '^#' .env | xargs) # load env vars
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

Testing:
```sh
pnpm -r test
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
