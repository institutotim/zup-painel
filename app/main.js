'use strict';

angular
  .module('zupPainelApp', [
    // external modules
    'ngCookies',
    'ngAnimate',
    'ngSanitize',
    'ngStorage',
    'ngRaven',
    'ui.router',
    'angularMoment',
    'ui.bootstrap',
    'ui.autocomplete',
    'ui.sortable',
    'ui.select2', // @todo Remove this library as soon as possible
    'ui.select',
    'ui.mask',
    'restangular',
    'infinite-scroll',
    'lrInfiniteScroll',
    'angularFileUpload',
    'colorpicker.module',
    'frapontillo.bootstrap-switch',
    'monospaced.elastic',
    'angularPromiseButtons',
    'ui.sortable',
    'dibari.angular-ellipsis',
    'rt.popup',
    'pascalprecht.translate',

    // Providers
    'AuthorizationProviderModule',

    // Core services
    'AuthServiceModule',
    'UserServiceModule',
    'FullResponseRestangularServiceModule',
    'ErrorServiceModule',
    'ConfirmDialogDirectiveModule',
    'monospaced.elastic',
    'ZupChatDirectiveModule',
    'ReturnFieldsModule',
    'ApiTranslationsLoaderModule',

    // Core components
    'NavItemComponentModule',
    'DetectScrollTopComponentModule',
    'ZupTranscludeComponentModule',
    'NotificationsCenterComponentModule',
    'NamespaceSelectorModule',

    // Constants
    'config',

    // Routes
    'IndexModule',
    'UserModule',
    'ReportsModule',
    'ItemsModule',
    'ConfigModule',
    'UsersModule',
    'GroupsModule',
    'HelpModule',
    'FlowsModule',
    'CasesModule',
    'BusinessReportsModule',
    'ServicesModule',
    'ChatRoomsModule'
  ]);
