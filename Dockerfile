FROM node:14.19.0-buster
MAINTAINER yuu

ENV DEBIAN_FRONTEND noninteractive
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
        echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y --no-install-recommends \
        yarn
RUN apt-get clean
ENV DEBIAN_FRONTEND dialog

WORKDIR /app

CMD ["/app/entrypoint.sh"]
