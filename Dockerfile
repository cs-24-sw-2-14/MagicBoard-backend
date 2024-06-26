FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5123

CMD ["npx", "ts-node", "src/server.ts"]
