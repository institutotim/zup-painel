#######################################################################################
# !!!!! AO MODIFICAR ESSE ARQUIVO LEMBRE-SE DE ATUALIZAR O prepare_publication.sh !!!!!
#######################################################################################

FROM selenium/standalone-chrome:2.47.1

ENV NODE_VERSION 0.12.4

USER root

RUN DEBIAN_FRONTEND=noninteractive apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends build-essential git-core bzip2 curl python

# Install Nodejs, bower and grunt
RUN \
  cd /tmp && \
  curl -s -o node.tar.gz http://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.gz && \
  tar xvzf node.tar.gz && \
  rm -f node.tar.gz && \
  cd node-v* && \
  ./configure && \
  CXX="g++ -Wno-unused-local-typedefs" make && \
  CXX="g++ -Wno-unused-local-typedefs" make install && \
  cd /tmp && \
  printf '\n# Node.js\nexport PATH="node_modules/.bin:$PATH"' >> /root/.bashrc


# Update npm and install bower and grunt
RUN \
  npm install -g npm && \
  npm install -g bower grunt-cli

# Install compass
RUN DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends ruby ruby-dev && \
  gem install sass --version 3.4.16 && \
  gem install compass --version 1.0.3

# Install application dependencies
RUN bower --allow-root cache clean && git config --global url."http://".insteadOf git://

# Build ZUP Painel
RUN mkdir /tmp/zup-painel
WORKDIR /tmp/zup-painel
ADD ./.bowerrc ./.bowerrc
ADD ./bower.json ./bower.json
ADD ./package.json ./package.json
RUN npm install && bower install --allow-root
RUN ./node_modules/.bin/webdriver-manager update
ADD . /tmp/zup-painel
RUN mv build.env .env
RUN NODE_ENV=production ./node_modules/.bin/grunt build

COPY entry_point.sh /opt/bin/entry_point.sh
RUN chmod +x /opt/bin/entry_point.sh

USER seluser
