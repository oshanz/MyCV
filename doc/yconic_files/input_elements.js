y.Register( "UI", ( function() {
    var ui = {};

    var error_message_selector = ".input_error_message";
    var error_state_class = "has-error";
    var error_message = "<span class='input_error_message'></span>";
    var in_progress_state_class = "in-progress";
    var spinner = "<div class='spinner'>" + y.Content.Get( "in_progress" ) + "</div>";
    $( document ).on( "error", ".js-can_error", function( e, error_name ) {
        var elem = $( this );
        var elem_offset = elem.offset();
        var error = $( error_message ).text( elem.data( error_name ) );

        if( !elem.data( error_name ) ) {
            return;
        }

        var old_error_elem = elem.data( "active_error" );
        if( old_error_elem ) {
            old_error_elem.remove();
        }

        elem.data( "active_error", error );

        elem.addClass( error_state_class );
        elem.before( error );
        error.offset( {
            "top": elem_offset.top - 23,
            "left": elem_offset.left + elem.outerWidth( true ) - error.outerWidth( true )
        } );
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( entity_type && entity_id ){
            y.Markers.Add( entity_type, entity_id, "ERROR_MESSAGE_DISPLAYED", {"message": error_name} );
        }
    } );

    $( document ).on( "clear_errors", ".js-can_error", function() {
        var elem = $( this );
        var error_elem = elem.data( "active_error" );
        if( error_elem ) {
            error_elem.remove();
        }
        elem.removeClass( error_state_class );
    } );

    $( document ).on( "in_progress", ".js-can_progress", function() {
        var elem = $( this );
        var new_spinner = $( spinner );
        var offset = elem.offset();
        new_spinner.css( {
            "top": offset.top + "px",
            "left": offset.left + "px",
            "display": elem.css( "display" ),
            "line-height": elem.css( "line-height" ),
            "width": elem.outerWidth(),
            "height": elem.outerHeight()
        } );

        var placeholder = elem.clone().css( "visibility", "hidden" );

        $( "body" ).append( new_spinner );
        elem.before( placeholder );
        elem.data( "progress_spinner", new_spinner );
        elem.data( "progress_placeholder", placeholder );
        elem.addClass( in_progress_state_class );
        elem.hide();
    } );

    $( document ).on( "progress_complete", ".js-can_progress", function() {
        var elem = $( this );
        if( elem.hasClass( in_progress_state_class ) ) {
            elem.show();
            elem.removeClass( in_progress_state_class );
            elem.data( "progress_spinner" ).remove()
            elem.data( "progress_placeholder" ).remove();
        }
    } );

    $( document ).on( "focus", "select", function() {
        var elem = $( this );
        elem.parent().addClass( "is-focused" );
    } );

    $( document ).on( "blur", "select", function() {
        var elem = $( this );
        elem.parent().removeClass( "is-focused" );
    } );

    // Container should contain a .js-ui-add_another button, along with *one* select or input with a class of .js-ui-add_another-input. Callback is optional and will be executed after the new element is added.
    ui.BindAddAnother = function( container, callback ) {
        var input = container.find( ".js-ui-add_another-input" ).first();
        container.on( "click", ".js-ui-add_another", function( e ) {
            e.preventDefault();
            var input_clone = input.clone();
            input_clone.val( "" );
            $( this ).before( input_clone );

            if( input_clone.is( "select" ) && y.Util.IsDesktop() ) {
                input_clone.selectmenu( { "width": "100%" } )
            }

            if( callback ) {
                callback( input_clone );
            }
        } );
    }

    // Handles setting and removing the spinner icon on click and prevents the page from jumping
    ui.MakeButtonClickHandler = function( callback ) {
        return function( e ) {
            e.preventDefault();
            var elem = $( this );
            elem.trigger( "in_progress" );
            callback().done( function( result ) {
                if( result !== "keep_spinner" ) {
                    $( elem ).trigger( "progress_complete" );
                }
            } );
        }
    }

    return ui;
} )() );
