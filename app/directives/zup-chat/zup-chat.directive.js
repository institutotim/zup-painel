/**
 *
 * Chat directive
 *
 * Message format:
 *
 *      "user": { ... } // Dados do usuário, no caso da mensagem de ser um usuário
 *      "kind": "user" // Se a mensagem é do usuário ou do sistema
 *      "content": "Mensagem de teste",
 *      "created_at": "2007-04-05T14:30"
 *
 * Usage:
 *
 * <zup-chat
 *    user="current_user"
 *    chattable-type="chat_room"
 *    chattable-id="13">
 * </zup-chat>
 *
 */
angular.module('ZupChatDirectiveModule', ['mentio', 'ChatServiceModule'])
  .directive('zupChat', function () {
    return {
      restrict: 'E',
      templateUrl: 'directives/zup-chat/zup-chat.template.html',
      scope: {
        user: '=',
        chattableType: '@',
        chattableId: '@'
      },

      link: function (scope, element, $timeout) {
        // Infinite Scroll
        var $container = $(element).find('.zc-messages');
        $container.scroll(function () {
          if ($container.scrollTop() == 0) {
            var newPos = $container.find('.zc-day-messages:first');

            scope.loadMessages().then(function (rawMessages) {
              if (rawMessages.length > 1) {
                $container.scrollTop(newPos.position().top);
              }
            });
          }
        });
      },

      controller: function ($scope, $element, $timeout, $log, $rootScope, ChatService) {
        var page = 1, per_page = 25;

        $scope.dayMessagesMap = {};
        $scope.newMessage = '';
        $scope.mentions = {};
        $scope.showPostMessageBtn = false;

        function initialize() {
          $scope.loadMessages().then(function () {
            scrollToBottom();
          });
        }

        function pad(num, size) {
          var s = num + "";
          while (s.length < size) s = "0" + s;
          return s;
        }

        function scrollToBottom() {
          $timeout(function () {
            var container = $($element).find('.zc-messages');
            container.scrollTop(container[0].scrollHeight);
          });
        }

        $scope.loadMessages = function() {
          var options = {
            page: page,
            per_page: per_page
          };

          $scope.loading = true;
          return ChatService
            .listMessages($scope.chattableType, $scope.chattableId, options)
            .then(function (response) {
              $scope.loading = false;

              var rawMessages = response.data;

              for (var i = rawMessages.length - 1; i >= 0; i--) {
                var rawMessage = rawMessages[i];
                var date = new Date(rawMessage.created_at);
                var dateKey = date.getFullYear() + pad(date.getMonth(), 2) + pad(date.getDay(), 2);

                if (!$scope.dayMessagesMap[dateKey]) {
                  $scope.dayMessagesMap[dateKey] = {};
                  $scope.dayMessagesMap[dateKey]['date'] = date;
                  $scope.dayMessagesMap[dateKey]['messages'] = [];
                }

                var message = angular.extend(rawMessage, {
                  hour: pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2)
                });

                $scope.dayMessagesMap[dateKey]['messages'].push(message);
              }

              page++;
              return rawMessages;
            });
        };

        $scope.getRawText = function(item){
          $scope.mentions[item.name] = item.id;
          return '[~' + item.name + ']';
        };

        $scope.searchItem = function(term) {
          $scope.items = [];

          var skip = /U\d/g;
          if(!skip.test(term)) {
            ChatService
              .autoCompleteUser(term)
              .then(function (response) {
                $scope.items = response.data;
              });
          }

        };

        $scope.postMessage = function() {
          if ($scope.newMessage == '') {
            return;
          }

          $scope.newMessage = $scope.newMessage.replace(/\[~(.*)\]/,
            function (match, userName) {
              return '@[' + $scope.mentions[userName] + ':' + userName + ']';
            });

          ChatService
            .postMessage($scope.newMessage, $scope.chattableType, $scope.chattableId)
            .then(function (response) {
              $rootScope.showMessage('ok', 'Mensagem postada com sucesso!', 'success', false);

              var message = response.data;
              var date = new Date(message.created_at);
              var dateKey = date.getFullYear() + pad(date.getMonth(), 2) + pad(date.getDay(), 2);

              if (!$scope.dayMessagesMap[dateKey]) {
                $scope.dayMessagesMap[dateKey] = {};
                $scope.dayMessagesMap[dateKey]['date'] = date;
                $scope.dayMessagesMap[dateKey]['messages'] = [];
              }

              var message = angular.extend(message, {
                hour: pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2)
              });

              $scope.dayMessagesMap[dateKey]['messages'].push(message);

              $scope.newMessage = '';

              scrollToBottom();
            })
            .catch(function () {
              $rootScope.showMessage('exclamation-sign', 'Não foi possivel postar a mensagem. Por favor, tente novamente.', 'success', false);
            });
        };

        initialize();
      }
    }
  })
  .directive('zcTextWithMentions', function ($compile) {
    return {
      restrict: 'A',
      scope: {zcTextWithMentions: '=zcTextWithMentions'},
      link: function (scope, ele, attrs) {

        function replaceUserMentions(rawContent) {
          return rawContent.replace(/@\[(.*):(.*)\]/,
            function (match, userId, userName) {
              return '<a href=\"#/users/'+ userId +'\">' + userName + '</a>'
            });
        };

        function refresh() {
          var content = angular.element('<div></div>').html(replaceUserMentions(scope.zcTextWithMentions)).contents();
          var compiled = $compile(content);
          ele.html('');
          ele.append(content);
          compiled(scope);
        };

        refresh();


        scope.$watch('zcTextWithMentions', function(newValue, oldValue){
          refresh();
        });

      }

    }

  });
