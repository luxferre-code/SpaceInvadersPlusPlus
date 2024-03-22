FROM debian:latest

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y git npm

RUN mkdir /data

RUN git clone https://gitlab.univ-lille.fr/thomas.gysemans.etu/sae-2024-groupek-gysemans-robin-thuillier.git /data
WORKDIR /data
RUN npm i

FROM node
COPY --from=0 /data/ /home/node/app/
RUN chmod 777 -R /home/node/app/