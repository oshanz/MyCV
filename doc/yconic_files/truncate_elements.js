y.Register( "TruncateElements", ( function( parent, number, options ) {
    var defaults = {
        "number": 3
    }

    internal_options = {};
    _.extend( internal_options, defaults, options );

    var children = parent.children();

    if( children.length > internal_options.number ) {
        var visible_childern = children.slice(0, internal_options.number );
        var remainder = children.slice(internal_options.number, children.length);
        remainder.detach();
        parent.data( "hidden_children", remainder );
        var thread_id = parent.parent().data("id");
        var button = $( "<a href='#' class='js-link_followed_marker' data-marker-link_followed='thread_feed_show_more_entity_tags' data-marker-entity_type='THREAD' data-marker-entity_id=" + thread_id + ">(" + remainder.length + ") more</a>" );
        parent.append( button );
        button.on( "click", function( e ) {
            e.preventDefault();
            button.detach();
            parent.append( parent.data( "hidden_children" ) );
        } );
    }
} ) );
