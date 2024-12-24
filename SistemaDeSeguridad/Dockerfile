FROM node:lts

WORKDIR /SistemaDeSeguridad

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8081

RUN npm run build

CMD ["npm", "run", "start"]

