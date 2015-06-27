( function() {
    /* TODO: Do we need so many functions? */
    y.Register( "Markers", {
        "IMPRESSION_TYPE_ELEMENT": "ELEMENT",
        "IMPRESSION_TYPE_PAGE": "PAGE",
        "IMPRESSION_TYPE_ENTITY": "ENTITY"
    } );

    y.Markers.AddExternalLinkClickMarker = function( entity_id, entity_type, link_clicked_url ) {
        var action_data = {
            "link_clicked_url": link_clicked_url,
            "current_page": window.location.href
        };

        y.Markers.Add( entity_type, entity_id, "EXTERNAL_LINK_CLICKED", action_data )
    }

    y.Markers.AddImpressionMarker = function( entity_id, entity_type, type, data ) {
        // type is an impression type defined in Markers
        var action_data = {
            "impression_data": JSON.stringify( data ),
            "impression_type": type
        };

        y.Markers.Add( entity_type, entity_id, "IMPRESSION", action_data )
    }

    y.Markers.AddPageViewMarker = function() {
        y.Markers.Add( "SITE", y.SITE_ID, "PAGE_VIEW", {
            "page_url": location.href,
            "user-agent": navigator.userAgent
        } );
    }

    y.Markers.AddLinkSharedMarker = function( entity_id, entity_type, link_shared_url, link_shared_medium ) {
        var action_data = {
            "link_shared_url": link_shared_url,
            "current_page": window.location.href,
            "link_shared_medium": link_shared_medium
        };

        y.Markers.Add( entity_type, entity_id, "LINK_SHARED", action_data );
    }

    y.Markers.AddCheckboxMarker = function( entity_id, entity_type, checkbox_name, is_now_checked ) {
        var action_data = {
            "checkbox_name": checkbox_name,
            "is_now_checked": is_now_checked,
            "current_page": window.location.href
        };

        y.Markers.Add( entity_type, entity_id, "CHECKBOX_TOGGLED", action_data )
    }

    y.Markers.Add = function( entity_type, entity_id, action, action_data ) {
        var data = {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "action": action,
            "action_data": action_data
        }
        var settings = {
            "contentType": "application/json; charset=UTF-8",
            "dataType": "json",
            "type": "POST",
            "data": JSON.stringify( data )
        }
        $.ajax( "/add-marker", settings );
    }

    $( document ).on( "click", "a.js-external_link_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        y.Markers.AddExternalLinkClickMarker( entity_id, entity_type, $( this ).attr( "href" ) );
    } );

    $( document ).on( "click", "input.js-checkbox_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        y.Markers.AddCheckboxMarker( entity_id, entity_type, $( this ).data( "marker-checkbox_name" ), $( this ).prop( "checked" ) )
    } );

    $( document ).on( "click", "a.js-field_added_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        y.Markers.Add( entity_type, entity_id, "FIELD_ADDED", {"field_added": $( this ).data( "marker-field_added" )} )
    } );

    $( document ).on( "click", "a.js-link_followed_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        var action_data = {
            "link_followed": $( this ).data( "marker-link_followed" ),
            "current_page": window.location.href
        };
        y.Markers.Add( entity_type, entity_id, "LINK_FOLLOWED", action_data )
    } );

    $( document ).on( "change, selectmenuchange", ".js-dropdown_selected_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        var action_data = {
            "dropdown": $( this ).data( "marker-dropdown" ),
        };
        y.Markers.Add( entity_type, entity_id, "DROPDOWN_OPTION_SELECTED", action_data )
    } );

    $( document ).on( "change", ".js-text_field_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        var action_data = {
            "field": $( this ).data( "marker-text_field" ),
        };
        y.Markers.Add( entity_type, entity_id, "TEXT_FIELD_ENTERED", action_data )
    } );

    $( document ).on( "autocompletechange", ".js-autocomplete_field_marker", function() {
        var entity_type = $( this ).data( "marker-entity_type" );
        var entity_id = $( this ).data( "marker-entity_id" );
        if( !entity_type  ) {
            entity_type = "SITE";
        }
        if( !entity_id ) {
            entity_id = y.SITE_ID;
        }
        var action_data = {
            "field": $( this ).data( "marker-text_field" ),
        };
        y.Markers.Add( entity_type, entity_id, "AUTOCOMPLETE_FIELD_SELECTED", action_data )
    } );

} )();
