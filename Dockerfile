FROM node:16.10-alpine
WORKDIR /var/www

COPY . /var/www

RUN npm i

CMD node ./bin/app.js