( function() {
    var util = {};
    y.Register( "Util", util );

    util.CURRENT_TIME = null;
    util.PLATFORM = "";

    util.FormatMoneyString = function( money ) {
        var rounded_money = Math.round( money * 100 ) / 100
        return "$" + rounded_money.toString().replace( /\B(?=(\d{3})+(?!\d))/g, "," );
    }

    util.GetCookie = function( name ) {
        name = name + "=";
        var cookies = document.cookie.split( ";" );

        for( var i = 0; i < cookies.length; ++i ) {
            var cookie = cookies[i];
            while( cookie.charAt( 0 ) === ' ' ) {
                cookie = cookie.substring( 1 );
            }
            if( cookie.indexOf( name ) !== -1 ) {
                return decodeURIComponent( cookie.substring( name.length, cookie.length ) );
            }
        }

        return "";
    }

    util.GetLocationCookieValue = function() {
        var name = "base_resources_location_cookie=";
        var cookies = document.cookie.split( ";" );

        for( var i = 0; i < cookies.length; ++i ) {
            var cookie = cookies[i];
            while( cookie.charAt( 0 ) == ' ' ) {
                cookie = cookie.substring( 1 );
            }
            if( cookie.indexOf( name ) != -1 ) {
                return decodeURIComponent( cookie.substring( name.length, cookie.length ) );
            }
        }

        return "";
    }

    util.GetQueryString = function( key ) {
        var queries = window.location.search.replace( "?", "" ).split( "&" );
        for( var i = 0; i < queries.length; ++i ) {
            var query = queries[i].split( "=" );
            if( query.length == 2 ) {
                if( query[0] === key ) {
                    return query[1]
                }
            }
        }
        return "";
    }

    // Verifies that a date string is in the form yyyy-mm-dd and is valid.
    // TODO: Is this necessary? I'd prefer to do this server-side.
    util.IsDateStringValid = function( date_string ) {
        var re = /^\d{4}-\d{2}-\d{2}$/;
        if( re.test( date_string ) !== true ) {
            return false;
        }

        var date_parts = date_string.split( "-" );

        var year = parseInt( date_parts[0], 10 );
        var month = parseInt( date_parts[1], 10 ) - 1;
        var day = parseInt( date_parts[2], 10 );

        var test_date = new Date( year, month, day );

        if( year === ( test_date.getYear() + 1900 ) && month === test_date.getMonth() && day === test_date.getDate() ) {
            return true;
        }

        return false;
    }

    util.IsDesktop = function() {
        return util.PLATFORM === "DESKTOP";
    }

    util.IsMobile = function() {
        return util.PLATFORM === "MOBILE";
    }

    util.Post = function( url, data ) {
        return $.ajax( url, {
            "method": "POST",
            "data": JSON.stringify( data ),
            "dataType": "json",
            "contentType": "application/json"
        } );
    }

    util.SetCookie = function( name, value, expires, path ) {
        name = name + "=";

        if( _.isUndefined( value ) ) {
            value = ";"
        } else {
            value = value + "; "
        }

        if( _.isUndefined( expires ) ) {
            expires = ""
        } else {
            expires = "expires=" + expires + "; "
        }

        if( _.isUndefined( path ) ) {
            path = ""
        } else {
            path = "path=" + path + ";"
        }
        document.cookie = name + value + expires + path;
    }

    util.SortOptionsByOrder = function( parent_element, selector ) {
        var children;
        if( selector ) {
            children = parent_element.children( selector );
        } else {
            children = parent_element.children();
        }

        var selected = parent_element.val();
        children.detach().sort( function( a, b ) {
            return $( a ).data( "order" ) < $( b ).data( "order" ) ? -1 : ( $( a ).data( "order" ) === $( b ).data( "order" ) ? 0 : 1 )
        } ).appendTo( parent_element );
        parent_element.val( selected );

        return parent_element;
    }

    util.SortOptionsAlphabetically = function( parent_element, selector ) {
        var children;
        if( selector ) {
            children = parent_element.children( selector );
        } else {
            children = parent_element.children();
        }

        var selected = parent_element.val();

        children.detach().sort( function( a, b ) {
            return $( a ).text() < $( b ).text() ? -1 : ( $( a ).text() === $( b ).text() ? 0 : 1 )
        } ).appendTo( parent_element );
        parent_element.val( selected );

        return parent_element;
    }

    util.UnixToRelativeTime = function( unix_time, future ) {
        var SECOND = 1000;
        var MINUTE = 60 * SECOND;
        var HOUR = 60 * MINUTE;
        var DAY = 24 * HOUR;
        var WEEK = 7 * DAY;
        var original_date;
        if( unix_time === -1 || ( util.CURRENT_TIME < unix_time && !future ) ) {
            original_date = new Date( util.CURRENT_TIME * 1000 );
        } else {
            original_date = new Date( unix_time * 1000 );
        }
        var current_date = new Date( util.CURRENT_TIME * 1000 );
        var difference;
        if( future ) {
            difference = original_date - current_date;
        } else {
            difference = current_date - original_date;
            difference = difference < 0 ? 0 : difference;
        }

        var date_string;
        var time;

        if( difference <= MINUTE ) {
            time = Math.round( difference/SECOND )
            date_string = "" + time + " second" + (time === 1 ? "" : "s" ) + " ago";
        } else if( difference <= HOUR ) {
            time = Math.round( difference/MINUTE )
            date_string = "" + time + " minute" + (time === 1 ? "" : "s" ) + " ago";
        } else if( difference <= DAY ) {
            time = Math.round( difference/HOUR )
            date_string = "" + time + " hour" + (time === 1 ? "" : "s" ) + " ago";
        } else if( difference <= WEEK ) {
            time = Math.floor( difference/DAY )
            date_string = "" + time + " day" + (time === 1 ? "" : "s" ) + " ago";
        } else if( difference <= WEEK * 4 ) {
            time = Math.floor( difference/WEEK )
            date_string = "" + time + " week" + (time === 1 ? "" : "s" ) + " ago";
        } else if( difference <= WEEK * 8 ) {
            time =  Math.floor( difference/( WEEK * 4 ) )
            date_string = "" + time + " month" + (time === 1 ? "" : "s" ) + " ago";
        } else {
            date_string = original_date.toLocaleDateString();
        }

        if( future ) {
            date_string = date_string.replace( " ago", "" );
        }

        return date_string
    }

    util.ValidateEmail = function( email ) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    util.VisibleInWindowHandler = function( elem, onscreen_callback, offscreen_callback ) {
        var scrolltop = $( window ).scrollTop();
        var height = $( window ).height();
        var last_state = null;

        $( window ).scroll( function( event ) {
            var scrolltop = $( window ).scrollTop();
            var height = $( window ).height();
            var onscreen = ( scrolltop + height >= elem.offset().top + elem.height() ) && ( scrolltop < elem.offset().top );

            if( onscreen ) {
                if( last_state === null || last_state !== "on_screen" ) {
                    last_state = "on_screen";
                    onscreen_callback( event );
                }
            } else {
                if( last_state === null || last_state !== "off_screen" ) {
                    last_state = "off_screen";
                    offscreen_callback( event );
                }
            }
        } );

        $( window ).scroll();
    }

    util.SanitizePath = function( path ) {
        return path.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }
} )();
