/*
 * Truncate plugin Copyright (c) Yconic 2015
 * Forked from version 1.1.0 of the jQuery Succinct plugin,
 * https://github.com/micjamking/Succinct
 * Copyright (c) 2014 Mike King (@micjamking)
 *
 * Licensed under the MIT License
 */

( function($) {
    $.fn.truncate = function( options ) {
        var settings = $.extend( {
            size: 240,
            omission: '&hellip; ',
            open_button: "<a href='#'>Show more</a>",
            close_button: "<a href='#'>Hide</a>",
            open_callback: function() {},
            close_callback: function() {}
        }, options );

        return this.each( function( i, elem ) {
            elem = $( elem )
            var regex = /[!-\/:-@\[-`\n{-~]$/;
            var open = $( settings.open_button );
            var close = $( settings.close_button );

            var elem = $( this );
            var text_default = elem.html();
            var text_truncated = text_default;
            text_truncated = $.trim( text_truncated ).substring( 0, settings.size ).split( ' ' ).slice( 0, -1 ).join( ' ' );
            text_truncated = text_truncated.replace( regex, '' );
            var hide = function( e ) {
                if( e ) {
                    e.preventDefault();
                }
                close.detach();
                if ( text_default.length > settings.size ) {
                    elem.html( text_truncated + settings.omission );

                    elem.append( open );
                }
                settings.close_callback();
            }
            var reveal = function( e ) {
                if( e ) {
                    e.preventDefault();
                }
                open.detach();
                elem.html( text_default );
                elem.append( close );
                settings.open_callback();
            }
            open.click( reveal );
            close.click( hide );
            hide();
        } );
    };
} )( jQuery );
