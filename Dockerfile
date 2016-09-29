FROM node:latest
MAINTAINER imeoer@gmail.com
RUN apt-get update; apt-get -y install git
RUN wget -O caddy.tgz "https://caddyserver.com/download/build?os=linux&arch=amd64"
RUN mkdir caddy
RUN tar -xvzf caddy.tgz -C caddy
RUN git clone https://github.com/hyperhq/website.git && cd website && git checkout update-tagline
EXPOSE 80
CMD cd website && /website/build.sh && /caddy/caddy -port 8080 -root /website/dist
