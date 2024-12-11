FROM node:22.3.0 AS builder

WORKDIR /build_

COPY package.json ./

RUN npm install


FROM node:22.3.0

WORKDIR /build_

COPY --from=BUILDER /build_/node_modules ./

COPY . .

CMD ["npm", "run", "dev"]