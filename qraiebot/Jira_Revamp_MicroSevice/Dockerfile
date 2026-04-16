FROM node:18-buster-slim


WORKDIR /src/app


COPY Jira_Revamp_MicroSevice/package.json /src/app/

RUN npm install

COPY Jira_Revamp_MicroSevice/ /src/app/

CMD ["node","index.js"]

