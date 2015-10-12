y.Community.PostAs = ( function() {
    var post_as = {
        "NAME": "",
        "ThreadData": {
            "is_anonymous": false,
            "has_posted": false
        },
        "OverlayData": {
            "is_anonymous": false
        }
    };

    post_as.Init = function( elem, in_overlay ) {
        elem.find( ".js-community-post_as-toggle_anonymity" ).click( function( event ) {
            event.preventDefault();
            if( !in_overlay ) {
                if( post_as.ThreadData.has_posted ) {
                    var message = "";
                    if( post_as.ThreadData.is_anonymous ) {
                        message = "This will de-anonymize all your posts in this thread. Continue?";
                    } else {
                        message = "This will make all your posts in this thread anonymous. Continue?";
                    }
                    if( !confirm( message ) ) {
                        return
                    }
                }
            }

            post_as_elements = elem;
            if( !in_overlay ) {
                post_as_elements = $( ".js-community-post_as" );
            }

            var is_anonymous = post_as.ThreadData.is_anonymous;
            if( in_overlay ) {
                is_anonymous = post_as.OverlayData.is_anonymous;
            }

            if( is_anonymous ) {
                post_as_elements.find( ".js-community-post_as-name" ).html( post_as.NAME );
                post_as_elements.find( ".js-community-post_as-anonymous_photo" ).hide();
                post_as_elements.find( ".js-community-post_as-member_photo" ).show();
                post_as_elements.find( ".js-community-post_as-toggle_anonymity" ).text( "Make Anonymous" );
            } else {
                post_as_elements.find( ".js-community-post_as-name" ).text( "Anonymous" );
                post_as_elements.find( ".js-community-post_as-toggle_anonymity" ).html( "Post as" + " " + post_as.NAME );
                post_as_elements.find( ".js-community-post_as-anonymous_photo" ).show();
                post_as_elements.find( ".js-community-post_as-member_photo" ).hide();
            }

            if( in_overlay ) {
                post_as.OverlayData.is_anonymous = !is_anonymous
                y.Markers.Add( "FEATURE", "NEW_DISCUSSION_OVERLAY", "TOGGLE_ANONYMITY", { "is_anonymous":!is_anonymous } );
            } else {
                post_as.ThreadData.is_anonymous = !is_anonymous
                y.Markers.Add( "FEATURE", "REPLY_IN_DISCUSSION", "TOGGLE_ANONYMITY", { "is_anonymous":!is_anonymous } );
            }
            
        } );
    };

    post_as.Toggle = function() {
        event.preventDefault();
        if( post_as.ThreadData.has_posted ) {
            var message = "";
            if( post_as.ThreadData.is_anonymous ) {
                message = "This will de-anonymize all your posts in this thread. Continue?";
            } else {
                message = "This will make all your posts in this thread anonymous. Continue?";
            }
            if( !confirm( message ) ) {
                return false
            }
        }

        post_as_elements = $( ".js-community-post_as" );

        if( post_as.ThreadData.is_anonymous ) {
            post_as_elements.find( ".js-community-post_as-name" ).html( post_as.NAME );
            post_as_elements.find( ".js-community-post_as-anonymous_photo" ).hide();
            post_as_elements.find( ".js-community-post_as-member_photo" ).show();
            post_as_elements.find( ".js-community-post_as-toggle_anonymity" ).text( "Make Anonymous" );
        } else {
            post_as_elements.find( ".js-community-post_as-name" ).text( "Anonymous" );
            post_as_elements.find( ".js-community-post_as-toggle_anonymity" ).html( "Post as" + " " + post_as.NAME );
            post_as_elements.find( ".js-community-post_as-anonymous_photo" ).show();
            post_as_elements.find( ".js-community-post_as-member_photo" ).hide();
        }

        post_as.ThreadData.is_anonymous = !post_as.ThreadData.is_anonymous;

        return true
    }

    return post_as;
}() );
