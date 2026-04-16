FROM node:18-buster-slim


WORKDIR /src/app


COPY Jira_Revamp_Gateway/package.json /src/app/

RUN npm install

COPY Jira_Revamp_Gateway/ /src/app/

CMD ["node","index.js"]

