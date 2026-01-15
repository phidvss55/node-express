FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build

FROM node:22-alpine as runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/build ./build

CMD ["node", "build/index.js"]
