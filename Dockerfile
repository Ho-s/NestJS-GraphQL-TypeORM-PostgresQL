FROM node:lts AS dist
COPY package.json yarn.lock ./

RUN yarn install

FROM node:lts AS node_modules
COPY package.json yarn.lock ./

RUN yarn install

FROM node:lts

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY --from=node_modules node_modules /usr/src/app/node_modules

COPY . /usr/src/app

CMD [ "yarn", "dev" ]
