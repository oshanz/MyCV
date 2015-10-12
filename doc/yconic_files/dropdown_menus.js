y.Register( "Menu", ( function() {
    var menu_functions = {};
    var is_closed = "is-closed";
    var is_open = "is-open";

    var open_menu = null;
    var open_primary_menu = null
    var menu_button = null;
    var menu_align = "";
    var speed = 100;

    $( window ).resize( function() {
        if( open_menu !== null ) {
            var button_position = menu_button.position();
            if( menu_align === "left" ) {
                open_menu.css( {
                    "top": "" + (button_position.top + menu_button.height() + 12) + "px",
                    "left": "" + button_position.left + "px"
                } );
            } else if( menu_align === "right" ) {
                open_menu.css( {
                    "top": "" + (button_position.top + menu_button.height() + 12) + "px",
                    "left": "" + (button_position.left - open_menu.width() + menu_button.width()) + "px"
                } );
            }
            if( y.Util.IsMobile() ) {
                menu.css( "max-width", "" + ( $( window ).width() - 20 ) + "px" );
                if( menu.position().left < 0 ) {
                    menu.css( "left", "20px" );
                }
            }
        }

    } );

    menu_functions.Close = function() {
        if( open_menu ) {
            open_menu.removeClass( is_open ).addClass( is_closed ).hide();
            open_menu = null;
        }
    }

    menu_functions.DropdownInit = function( button, menu, align ) {
        if( !align ) {
            align = "left";
        }

        button.click( function( e ) {
            e.preventDefault();


            if( menu.hasClass( is_closed ) ) {
                if( y.Util.IsMobile() ) {
                    menu.css( "max-width", "" + ( $( window ).width() - 20 ) + "px" );
                }

                var button_position = button.position();
                var menu_left = 0;
                if( align === "left" ) {
                    menu_left = button_position.left;
                    menu.css( {
                        "top": "" + (button_position.top + button.height() + 12) + "px",
                        "left": "" + menu_left + "px"
                    } );
                } else if( align === "right" ) {
                    menu_left = button_position.left - menu.width() + button.width();
                    menu.css( {
                        "top": "" + (button_position.top + button.height() + 12) + "px",
                        "left": "" + menu_left + "px"
                    } );
                }

                if( open_menu ) {
                    open_menu.removeClass( is_open ).addClass( is_closed ).hide();
                }

                if( y.Util.IsMobile() ) {
                    if( menu_left <= 0 ) {
                        menu.css( "left", "10px" );
                    }
                }

                menu.slideDown( speed ).promise().done( function() {
                    open_menu = menu;
                } );
                menu.removeClass( is_closed );
                menu.addClass( is_open );
                menu_button = button;
                menu_align = align;
                var entity_type = menu.data( "marker-entity_type" );
                var entity_id = menu.data( "marker-entity_id" );
                if( !entity_type  ) {
                    entity_type = "SITE";
                }
                if( !entity_id ) {
                    entity_id = y.SITE_ID;
                }
                y.Markers.Add( entity_type, entity_id, "DROPDOWN_OPENED", {"dropdown":menu.data( "marker-dropdown" )} );
            } else {
                menu.slideUp( speed );
                menu.addClass( is_closed );
                menu.removeClass( is_open );
                open_menu = null;
                var entity_type = menu.data( "marker-entity_type" );
                var entity_id = menu.data( "marker-entity_id" );
                if( !entity_type  ) {
                    entity_type = "SITE";
                }
                if( !entity_id ) {
                    entity_id = y.SITE_ID;
                }
                y.Markers.Add( entity_type, entity_id, "DROPDOWN_CLOSED", {"dropdown":menu.data( "marker-dropdown" )} );
            }
        } );
    }

    menu_functions.SideClose = function() {
        open_primary_menu.animate( {
            "width": "toggle"
        }, speed );
        open_primary_menu.addClass( is_closed );
        open_primary_menu.removeClass( is_open );
        open_primary_menu = null;
        y.Markers.Add( "FEATURE", "SEARCH_BAR", "PRIMARY_NAGIVATION_CLOSED", {} );
    }

    menu_functions.SideInit = function( button, menu ) {
        var button_position = button.offset();
        var speed = 100;

        button.click( function( e ) {
            e.preventDefault();
            if( menu.hasClass( is_closed ) ) {
                menu.animate( {
                    "width": "toggle"
                }, speed ).promise().done( function() {
                    open_primary_menu = menu;
                } );

                menu.removeClass( is_closed );
                menu.addClass( is_open );
                var entity_type = menu.data( "marker-entity_type" );
                var entity_id = menu.data( "marker-entity_id" );
                if( !entity_type  ) {
                    entity_type = "SITE";
                }
                if( !entity_id ) {
                    entity_id = y.SITE_ID;
                }
                y.Markers.Add( "FEATURE", "SEARCH_BAR", "PRIMARY_NAGIVATION_EXPANDED", {} );
            } else {
                menu.animate( {
                    "width": "toggle"
                }, speed );
                menu.addClass( is_closed );
                menu.removeClass( is_open );
                var entity_type = menu.data( "marker-entity_type" );
                var entity_id = menu.data( "marker-entity_id" );
                if( !entity_type  ) {
                    entity_type = "SITE";
                }
                if( !entity_id ) {
                    entity_id = y.SITE_ID;
                }
                open_primary_menu = null;
                y.Markers.Add( "FEATURE", "SEARCH_BAR", "PRIMARY_NAGIVATION_CLOSED", {} );
            }
        } );
    }

    $( document ).on( "click", function( e ) {
        if( open_menu && $( e.target ).closest( open_menu ).length === 0 ) {
            var entity_type = open_menu.data( "marker-entity_type" );
            var entity_id = open_menu.data( "marker-entity_id" );
            if( !entity_type  ) {
                entity_type = "SITE";
            }
            if( !entity_id ) {
                entity_id = y.SITE_ID;
            }

            y.Markers.Add( entity_type, entity_id, "DROPDOWN_IMPLICITLY_CLOSED", {"dropdown": open_menu.data( "marker-dropdown" )} );
            menu_functions.Close();
        }

        if( open_primary_menu && $( e.target ).closest( open_primary_menu ).length === 0 ) {
            menu_functions.SideClose();
            y.Markers.Add( "FEATURE", "SEARCH_BAR", "PRIMARY_NAGIVATION_IMPLICITLY_CLOSED", {} );
        }
    } );

    return menu_functions
} )() );
