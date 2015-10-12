y.Register( "RichTextEditor", ( function() {
    var editors = {};

    var active_class = "is-active";

    function handlePaste( e ) {
        e.preventDefault();
        var text = "";
        if( window.clipboardData && window.clipboardData.getData ) {
            text = window.clipboardData.getData( "Text" );
        } else if( e.originalEvent.clipboardData ) {
            text = e.originalEvent.clipboardData.getData( "text/plain" );
        } else {
            return;
        }

        var selection = rangy.getSelection();
        var ranges = selection.getAllRanges();
        for( var i = 0; i < ranges.length; i++ ) {
            var range = ranges[i];
            range.splitBoundaries();
            range.deleteContents();
            var node = document.createTextNode( text );
            range.insertNode( node );
            selection.removeAllRanges();
            selection.addRange( range );
            range.setStartAfter( node );
            range.setEndAfter( node );
            selection.collapseToEnd();
        }
    }

    function simplifyHtml( elem ) {
        var children = elem.find( "*" );
        for( var i = 0; i < children.length; i++ ) {
            var child = $( children[i] );
            var selector = "";
            if( child.is( "em" ) ) {
                selector = "em";
            } else if( child.is( "strong" ) ) {
                selector = "strong";
            } else if( child.is( "span.underline" ) ) {
                selector = "span.underline";
            } else if( child.is( "span.strikethrough" ) ) {
                selector = "span.strikethrough";
            }

            var parents = child.parentsUntil( elem );
            for( var j = 0; j < parents.length; j++ ) {
                if( $( parents[j] ).is( selector ) ) {
                    child.replaceWith( child.html() );
                }
            }
        }
    }

    function Clear( id ) {
        if( editors[id] ) {
            editors[id].find( ".js-rich_text_editor-input" ).html( "" );
        }
    }

    function Init( elem, id ) {
        editors[id] = elem;

        var bold_button = elem.find( ".js-rich_textarea-button[data-action='bold']" );
        var italic_button = elem.find( ".js-rich_textarea-button[data-action='italic']" );
        var underline_button = elem.find( ".js-rich_textarea-button[data-action='underline']" );
        var strikethrough_button = elem.find( ".js-rich_textarea-button[data-action='strikethrough']" );

        function handleButtonSelection() {
            // Show the correct button as active
            var selection = rangy.getSelection();
            var ranges = selection.getAllRanges();
            for( var i = 0; i < ranges.length; i++ ) {
                var range = ranges[i];
                var node = $( range.startContainer );
                if( node.parents( "strong" ).length > 0 ) {
                    bold_button.addClass( active_class )
                } else {
                    bold_button.removeClass( active_class )
                }

                if( node.parents( "em" ).length > 0 ) {
                    italic_button.addClass( active_class )
                } else {
                    italic_button.removeClass( active_class )
                }

                if( node.parents( "span.underline" ).length > 0 ) {
                    underline_button.addClass( active_class )
                } else {
                    underline_button.removeClass( active_class )
                }

                if( node.parents( "span.strikethrough" ).length > 0 ) {
                    strikethrough_button.addClass( active_class )
                } else {
                    strikethrough_button.removeClass( active_class )
                }
            }
        }

        var input = elem.find( ".js-rich_text_editor-input" ).last();
        var placeholder = input.find( ".js-rich_text_editor-placeholder" ).last();

        var input_state = "INIT";
        input.keyup( function( e ) {
            handleButtonSelection();
        } ).keydown( function( e ) {
            if( e.ctrlKey ) {
                if( e.keyCode === 66 ) { // ctrl-b
                    bold_button.click();
                } else if( e.keyCode === 85 ) { // ctrl-u
                    underline_button.click();
                } else if( e.keyCode === 76 ) { // ctrl-i
                    italic_button.click();
                } else if( e.keyCode === 83 ) { // ctrl-s
                    strikethrough_button.click();
                }
            }
        } );

        input.focus( function() {
            placeholder.detach();
            elem.addClass( "is-focused" );
        } ).blur( function() {
            var text = $.trim( input.text() );
            if( text.length === 0 ) {
                input.empty().append( placeholder );
            }
            elem.removeClass( "is-focused" );
        } ).click( handleButtonSelection );
        input.on( "paste", handlePaste );

        elem.find( ".js-rich_textarea-button" ).click( function( e ) {
            e.preventDefault();
            var button = $( this );
            var action = button.data( "action" );
            var wrapper;
            var format_selector;
            if( action === "bold" ) {
                wrapper = "<strong></strong>";
                format_selector = "strong";
            } else if( action === "italic" ) {
                wrapper = "<em></em>";
                format_selector = "em";
            } else if( action === "underline" ) {
                wrapper = "<span class='underline'></span>";
                format_selector = "span.underline";
            } else if( action === "strikethrough" ) {
                wrapper = "<span class='strikethrough'></span>";
                format_selector = "span.strikethrough";
            } else {
                return;
            }

            var selection = rangy.getSelection();
            var start_container = selection.startContainer;
            var start_offset = selection.startOffset;
            var ranges = selection.getAllRanges();
            for( var i = 0; i < ranges.length; i++ ) {
                var range = ranges[i];
                if( range.collapsed ) {
                    var formatted_ancestor = $( range.startContainer ).parents( format_selector ).first();
                    formatted_ancestor.replaceWith( formatted_ancestor.html() );
                    selection.removeAllRanges();
                    selection.addRange( range )
                    continue;
                }
                range.splitBoundaries();

                var apply_style = true;
                var nodes = range.getNodes();
                for( var j = 0; j < nodes.length; j++ ) {
                    var node = $( nodes[j] );
                    var formatted_node;
                    if( $( node ).is( format_selector ) ) {
                        formatted_node = node;
                    } else {
                        formatted_node = node.parents( format_selector ).first();
                    }

                    if( formatted_node.length > 0 ) {
                        formatted_node.replaceWith( formatted_node.html() );
                        apply_style = false;
                    }
                }
                if( apply_style ) {
                    for( var j = 0; j < nodes.length; j++ ) {
                        var node = $( nodes[j] );
                        node.wrap( wrapper )
                    }
                    range.setStart( range.startContainer, 0 );
                    selection.removeAllRanges();
                    selection.addRange( range )
                }
                simplifyHtml( input );
            }
            handleButtonSelection();
        } );
    }

    function GetContent( id ) {
        if( editors[id] ) {
            var content = editors[id].find( ".js-rich_text_editor-input" ).clone();
            content.find( ".js-rich_text_editor-placeholder" ).remove();
            return $.trim( content.html() );
        }
        return "";
    }

    function Get( id ) {
        return editors[id];
    }

    function Set( id, content ) {
        if( editors[id] ) {
            editors[id].find( ".js-rich_text_editor-input" ).html( content );
        }
    }

    return {
        "Clear": Clear,
        "Init": Init,
        "Get": Get,
        "GetContent": GetContent,
        "Set": Set
    }
} )() );