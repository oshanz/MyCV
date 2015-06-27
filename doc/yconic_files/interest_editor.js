y.Community.InterestEditor = ( function() {
    interest_editor = {};

    var editors = {};
    var available_interests = [];

    function remove_interest( e ) {
        var text = $( e.currentTarget ).parent().find( "input" ).val();
        e.preventDefault();
        $( e.currentTarget ).parent().remove();
        y.Markers.Add( "FEATURE", "NEW_DISCUSSION_OVERLAY", "INTEREST_REMOVED", {"interest": text} );
    }

    function edit_interest( e ) {
        var input = $( e.target );
        var old_text = input.val();
        init_autocomplete( input );
        input.autocomplete( "search", input.val() );

        y.Markers.Add( "FEATURE", "NEW_DISCUSSION_OVERLAY", "INTEREST_EDITED", {"interest": old_text} );
    }

    function maybe_close( e ) {
        if( e.which === 13 ) { // enter
            $( this ).blur();
            $( ".js-community-interest_editor-add" ).click();
        } else if( e.keyCode === 27 ) { // esc
            $( this ).blur();
        }
    }

    function unfocus() {
        var text = $( this ).val();
        if( $( this ).autocomplete( "instance" ) ) {
            $( this ).autocomplete( "destroy" );
        }
        if( $.trim( text ) === "" ) {
            $( this ).parent().remove();
            return;
        } else if( !_.contains( available_interests, text ) ) {
            $( this ).parent().remove();
            return;
        }
        var parent = $( this ).parent();
        parent.append( "<a href='#' class='community-interest_editor__interest__remove js-community-interest_editor-remove' alt='Remove interest'></a>" );
        parent.find( ".js-community-interest_editor-remove" ).click( remove_interest );
        parent.one( "click", edit_interest );
        $( this ).keypress();
        y.Markers.Add( "FEATURE", "NEW_DISCUSSION_OVERLAY", "INTEREST_ADDED", {"interest": text} );
    }

    function resize( e ) {
        var text = $( this ).val();
        if( e.which ) {
            var char_code = e.which;
            text += String.fromCharCode( char_code );
        }

        var test_size = $( '<div class="community-interest_editor__interest left js-community-interest_editor-interest">' + text + '</div>' );
        test_size.offset( { "left": -9999 } );
        $( "body" ).append( test_size );
        var width = Math.max( test_size.width(), 50 );
        $( this ).css( "width", width );
        test_size.remove();
    }

    function init_autocomplete( elem ) {
        elem.autocomplete( {
            "position": {
                "my": "left top+5",
                "at": "left bottom"
            },
            "delay": 0,
            "autoFocus": true,
            "minLength": 3,
            "source": function( request, response ) {
                $.getJSON( "/community/autocomplete", {
                    "Query": request.term
                } ).done( function( result ) {
                    // TODO: Set available interests
                    available_interests = _.map( result.suggestions, function( suggestion ) {
                        return suggestion.Name;
                    } );
                    response( result.suggestions );
                } );
            },
            focus: function( event, ui ) {
                return false;
            },
            select: function( event, ui ) {
                elem.val( ui.item.Name );
                elem.parent().data( "Id", ui.item.Id );
                elem.parent().data( "Type", ui.item.Type );
                elem.parent().data( "Name", ui.item.Name );
                elem.keypress(); // Trigger a resize event
                return false;
            }
        } ).autocomplete( "instance" )._resizeMenu = function() {
            this.menu.element.outerWidth( Math.max( elem.outerWidth( true ), 200 )  );
        }
        elem.autocomplete( "instance" )._renderItem = function( ul, item ) {
            this.menu.element.outerWidth( Math.max( elem.outerWidth( true ), 200 )  );
            return $( "<li>" ).append( item.Name ).appendTo( ul );
        };
    }

    interest_editor.Init = function( elem, id ) {
        editors[id] = elem;
        elem.find( ".js-community-interest_editor-remove" ).click( remove_interest );
        elem.find( ".js-community-interest_editor-interest" ).on( "click", edit_interest );

        elem.find( ".js-community-interest_editor-add" ).click( function( e ) {
            e.preventDefault();

            var interest = $( '<div class="community-interest_editor__interest left js-community-interest_editor-interest"><input type="text"></div>' );
            y.Markers.Add( "FEATURE", "NEW_DISCUSSION_OVERLAY", "LINK_FOLLOWED", {"link_followed": "add_interest_button"} );

            $( this ).before( interest );
            var input = interest.find( "input" );
            init_autocomplete( input );
            input.blur( unfocus ).keydown( maybe_close ).keypress( resize ).keypress().focus();
        } );
    }

    interest_editor.Get = function( id ) {
        var elem = editors[id];
        interests = elem.find( ".js-community-interest_editor-interest" );

        var interest_identifiers = [];
        interests.each( function( i, elem ) {
            elem = $( elem )
            var id = elem.data( "Id" );
            var type = elem.data( "Type" );
            if( id && type ) {
                interest_identifiers.push( {
                    "Id": id,
                    "Type": type,
                    "Name": elem.data( "Name" )
                } );
            }
        } );
        return interest_identifiers;
    }

    interest_editor.GetElem = function( id ) {
        return editors[id];
    }

    interest_editor.Set = function( id, interests ) {
        var elem = editors[id];

        _.each( interests, function( interest ) {
            var interest_elem = $( '<div class="community-interest_editor__interest left js-community-interest_editor-interest"><input type="text"><a href="#" class="community-interest_editor__interest__remove js-community-interest_editor-remove" alt="Remove interest"></a></div>' );
            interest_elem.data( "Id", interest.Id );
            interest_elem.data( "Type", interest.Type );
            interest_elem.data( "Name", interest.Name );
            interest_elem.find( ".js-community-interest_editor-remove" ).click( remove_interest );
            interest_elem.find( "input" ).on( "click", edit_interest );

            elem.prepend( interest_elem );

            var input = interest_elem.find( "input" );
            input.val( interest.Name );
            input.blur( unfocus ).keydown( maybe_close ).keypress( resize ).keypress();
        } );
    }

    return interest_editor;
} )();
