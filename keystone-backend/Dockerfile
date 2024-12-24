FROM node:lts

WORKDIR /keystone-backend

COPY package*.json ./

RUN npm install || (echo "NPM install failed" && tail -n 50 /root/.npm/_logs/*)

COPY . .

EXPOSE 3000

RUN npm run build

CMD ["npm", "run", "dev"]
