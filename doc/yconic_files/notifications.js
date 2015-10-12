y.Register( "Notifications", (function() {
    var notifications = {};
    var unread_notification_ids = [];

    notifications.GetMore = function() {
        return y.Util.Post( "/notifications/get", {
            "NumberToReturn": 5,
            "Offset": $( ".js-notifications-list" ).children().length
        } ).done( function( result ) {
            if( result.notifications && !result.notifications.IsCaiFailure ) {
                var template;
                var rendered_item;
                _.each( result.notifications, function( notification ) {
                    try {
                        var template_data = JSON.parse( notification.Data.Content );

                        if( template_data.reply_to_followed_thread ) {
                            template = _.template( $( ".js-notification_template-thread_reply" ).html() );
                            rendered_item = $( template( template_data.reply_to_followed_thread ) );
                            rendered_item.find( "img" ).attr( "src", template_data.reply_to_followed_thread.member_photo );
                        } else if( template_data.followed_entity_was_discussed ) {
                            template = _.template( $( ".js-notification_template-new_thread" ).html() );
                            rendered_item = $( template( template_data.followed_entity_was_discussed ) );
                            rendered_item.find( "img" ).attr( "src", template_data.followed_entity_was_discussed.member_photo );
                        } else if( template_data.entity_followed_entity ) {
                            template = _.template( $( ".js-notification_template-following_you" ).html() );
                            rendered_item = $( template( template_data.entity_followed_entity ) );
                            rendered_item.find( "img" ).attr( "src", template_data.entity_followed_entity.follower_photo );
                        }

                        if( notification.Data.WasRead ) {
                            rendered_item.addClass( "was-read" );
                        }

                        unread_notification_ids.push( notification.Data.NotificationId );
                        rendered_item.find( ".js-notifications-time" ).text( y.Util.UnixToRelativeTime( notification.Data.TimeCreated ) );
                        $( ".js-notifications-list" ).append( rendered_item );
                    } catch (e) {
                        return;
                    }
                } );
            }
            var notification_count = $( ".js-notifications-list" ).children( ".notification" ).not( ".was-read" ).length;
            $( ".js-notifications_count" ).text( notification_count )
            if( notification_count ) {
                $( ".js-notifications_count" ).show();
            }
        } );
    }

    notifications.MarkAllAsRead = function() {
        _.each( unread_notification_ids, function( id ) {
            y.Util.Post( "/notifications/mark-as-read", {
                "NotificationId": id
            } );
        } );
        unread_notification_ids = [];
    }

    notifications.MenuOpened = function() {
        notifications.MarkAllAsRead();
    }

    notifications.GetMoreAndClear = function() {
        var result = notifications.GetMore();
        notifications.MarkAllAsRead();
        return result;
    }

    return notifications;
} )() );