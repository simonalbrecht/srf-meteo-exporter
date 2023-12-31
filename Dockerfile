FROM node:21-alpine as build
WORKDIR /app

COPY package.json yarn.lock tsconfig.json ./
COPY src src
COPY .env.example .env

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:21-alpine as run
WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app/.env .env
COPY --from=build /app/dist dist
RUN yarn install --frozen-lockfile --production=true

ENV HOST 0.0.0.0
EXPOSE 3000

CMD ["node", "dist/index.js"]