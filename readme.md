# Zeladoria Urbana Participativa - Painel

## Introdução

Sabemos que o manejo de informação é uma das chaves para uma gestão eficiente, para isso o ZUP apresenta um completo histórico de vida de cada um dos ativos e dos problemas do município, incorporando solicitacões de cidadãos, dados georeferenciados, laudos técnicos, fotografias e ações preventivas realizadas ao longo do tempo. Desta forma, o sistema centraliza todas as informações permitindo uma rápida tomada de decisões tanto das autoridades como dos técnicos em campo.

Esse componente do Painel é responsável pela gestão completa administrativa por parte da instituição que está utilizando o projeto. Outros componentes são:

* Aplicativo Android e iOS para munícipes
* Aplicativo web para munícipes
* Aplicativo Android Técnico para fiscais e agentes de campo
* API

## Instalação

**Observação:** Esse README informa como subir o projeto em ambiente para desenvolvimento. Para informações sobre como fazer o deploy do projeto para produção, leia o [Guia de instalação](http://docs.zup.ntxdev.com.br/site/installation_docker/).

Para instalar o ZUP Painel em sua máquina, você precisará instalar:

 - nvm >= 0.26.0
 - npm >= 2.7.0
 - Ruby >= 2.0.0
 - Bower

# Setup do projeto

Depois de clonar o repositório, rode os comandos:

    cd zup-painel
    nvm install
    npm install -g bower
    npm run setup

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

    SERVER_IP=127.0.0.1
    SERVER_PORT=9000
    API_URL=http://your-api.zupinstance.com
    MAP_LAT=-23.549671
    MAP_LNG=-46.6321713
    MAP_ZOOM=11
    DEFAULT_CITY=São Paulo
    DEFAULT_STATE=SP
    DEFAULT_COUNTRY=Brasil

Para rodar os testes, você também precisa fazer o setup das seguintes variáveis:

    USER_EMAIL=teste.zup@gmail.com
    USER_PASSWORD=123456

Altere o `API_URL` para apontar para sua instância do ZUP API. `MAP`'s `LAT` e `LNG` são utilizadas para centralizar os mapas nas posições iniciais.
As variáveis `DEFAULT_CITY`, `DEFAULT_STATE` e `DEFAULT_COUNTRY` definem as informações geográficas padrões.

Se você precisa de acesso via uma VM, você deve alterar o `SERVER_IP` para o IP `0.0.0.0`.

# Build para produção

    npm run prod-build

O diretório `dist` irá conter todos os _assets_ para deploy em produção.

# Servidor para desenvolvimento

    npm run dev-server

# Rodando os testes

    npm run test
