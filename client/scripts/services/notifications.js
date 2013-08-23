(function(w) {

    "use strict";
    var angular = w.angular;

    angular.module('Thoth')
        .factory('$notifications', [function() {
            var notifications = [];
            return {

                ERROR: 'error',
                SUCCESS: 'success',
                WARNING: 'warning',
                INFO: 'info',

                classes: {
                    ERROR: 'alert-error',
                    SUCCESS: 'alert-success',
                    WARNING: 'alert-warning',
                    INFO: 'alert-info',
                },
                
                add: function(title, message, type) {
                    type = (type || 'INFO').toUpperCase();
                    notifications.push({
                        'class': this.classes[type],
                        title: title,
                        message: message
                    });
                },

                flush: function(username, password) {
                    notifications.length = 0;
                },

                getNotifications: function() {
                    return notifications;
                }

            };
        }
    ]);

}(window));