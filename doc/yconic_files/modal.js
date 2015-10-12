y.Register( "Modal", ( function() {
    var modal = {};
    var active_content = null;
    var active_content_parent = null;
    var speed = 250;

    modal.Close = function() {
        if( active_content && active_content_parent ) {
            var overlay = active_content.data( "marker-overlay" )
            active_content.detach().hide().appendTo( active_content_parent );
            $( ".js-modal_overlay" ).hide();
            active_content = null;
            active_content_parent = null;
            y.Markers.Add( "FEATURE", overlay, "OVERLAY_CLOSED", {} );
        }
    }

    modal.Resize = function() {
        if( active_content ) {
            var window_width = $( window ).width();
            var window_height = $( window ).height();
            active_content.css( "max-width", window_width * 0.90 );

            $( ".js-modal_overlay" ).css( "width", window_width );
            $( ".js-modal_overlay" ).css( "height", window_height );

            var left = ( window_width / 2 ) - ( active_content.outerWidth( true ) / 2 );
            var top = ( window_height / 2 ) - ( active_content.outerHeight( true ) / 2 );

            left = ( left < 0 ) ? 0 : left;
            top = ( top < 0 ) ? 0 : top;

            active_content.css( { "top": top, "left": left } );
        }
    }

    modal.Trigger = function( content ) {
        active_content = content;
        active_content_parent = content.parent();

        var window_width = $( window ).width();
        var window_height = $( window ).height();
        content.css( "max-width", window_width * 0.90 );

        content.detach()

        $( ".js-modal_overlay" ).css( "width", window_width );
        $( ".js-modal_overlay" ).css( "height", window_height );
        $( ".js-modal_overlay" ).empty().append( content );

        var content_clone = content.clone().offset( { "left": -9999 } ).show();
        $( "body" ).append( content_clone )

        var left = ( window_width / 2 ) - ( content_clone.outerWidth( true ) / 2 );
        var top = ( window_height / 2 ) - ( content_clone.outerHeight( true ) / 2 );

        left = ( left < 0 ) ? 0 : left;
        top = ( top < 0 ) ? 0 : top;

        content_clone.remove();

        content.css( { "top": top, "left": left } );

        $( ".js-modal_overlay" ).fadeIn( speed );
        content.fadeIn( speed );
        active_content = content;
    }

    $( document ).on( "click", ".js-modal_overlay", function( e ) {
        if( $( e.target ).hasClass( "js-modal_overlay" ) ) {
            modal.Close();
        }
    } );

    $( document ).on( "click", ".js-modal_overlay-close", function( e ) {
        e.preventDefault();
        modal.Close();
    } );

    $( window ).on( "resize", modal.Resize );

    return modal;
} )() );
