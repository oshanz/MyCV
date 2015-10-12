( function() {
    var optional = {};
    optional.FieldsOfStudy = [];
    optional.FieldsOfStudyToKeys = {};
    optional.PersonId = "";

    var consented_to_emails = false;

    optional.Init = function() {
        $( ".js-login_register-optional_form" ).find( ".js-ui-add_another-container" ).each( function( i, elem ) {
            if( $( elem ).find( ".js-login_register-fields_of_study" ).length > 0 ) {
                y.UI.BindAddAnother( $( elem ), function( elem ) { optional.SetupAutocomplete( elem, optional.FieldsOfStudy ) } );
            } else {
                y.UI.BindAddAnother( $( elem ) );
            }
        } );

        $( ".js-login_register-optional_form" ).on( "click", ".js-ui-add_another", y.Modal.Resize );
    }

    optional.TriggerOptionalOverlay = function( person_id, consent_to_emails ) {
        $( ".js-login_register-login_form" ).hide();
        $( ".js-login_register-register_form" ).hide();
        $( ".js-login_register-oauth_register_form" ).hide();
        $( ".js-login_register-optional_form" ).show();
        $( ".js-login_register-overlay_content" ).find( ".js-modal_overlay-close" ).hide();
        optional.PersonId = person_id;
        consented_to_emails = consent_to_emails;
        if( !consent_to_emails ) {
            $( ".js-login_register-secondary_subscribe_to_email" ).show();
        }
        $( ".js-login_register-overlay_content" ).data( "marker-overlay", "SECONDARY_REGISTRATION");
        y.Modal.Trigger( $( ".js-login_register-overlay_content" ) );
        ga( 'send', 'pageview', "#secondary_register_overlay" );
    }

    optional.PopulateFieldsOfStudy = function( fields ) {
        _.each( fields, function( field ) {
            y.LoginRegister.Optional.FieldsOfStudy.push( $.trim( field.Category ) + " - " + $.trim( field.Name ) );
            y.LoginRegister.Optional.FieldsOfStudyToKeys[$.trim( field.Category ) + " - " + $.trim( field.Name )] = $.trim( field.Key );
        } );
    }

    optional.SetupAutocomplete = function( elem, source ) {
        elem.autocomplete( {
            "source": source,
            "position": {
                "my": "left top+5",
                "at": "left bottom"
            },
            "delay": 0,
            "autoFocus": true,
            "minLength": 0
        } ).autocomplete( "instance" )._resizeMenu = function() {
            this.menu.element.outerWidth( Math.max( elem.outerWidth( true ), 200 ) );
        }
    }

    optional.SubmitOptional = function() {
        var inputs = $( ".js-login_register-optional_inputs" ).find( "input, checkbox, select" );
        inputs.trigger( "clear_errors" );
        var data = {
            "PersonId": optional.PersonId
        };
        inputs.each( function( i, elem ) {
            elem = $( elem );

            var key = elem.attr( "name" );
            var value = elem.val();
            if( elem.is( "input:checkbox" ) ) {
                value = elem.prop( "checked" );
                if( key === "SubscribeEmail" && consented_to_emails == true ) {
                    return;
                }
            } else if( elem.hasClass( "js-ui-add_another-input" ) ) {
                if( !data[key] ) {
                    data[key] = []
                }

                if( key === "FieldsOfInterest" ) {
                    value = optional.FieldsOfStudyToKeys[value];
                }

                data[key].push( value );
            } else {
                data[key] = value;
            }
        } );

        var result = $.Deferred();
        y.Util.Post( "/register-additional", data ).done( function( result ) {
            result = result.register;
            if( result && result.IsCaiFailure ) {
                result.resolve();
            } else {
                window.location.reload();
            }
        } );
        return result;
    }

    optional.InitKeypressHandler = function() {
        $( ".js-login_register-inputs" ).on( "keydown", function( e ) {
            if( e.which === 13 ) {
                $( ".js-login_register-submit_optional" ).click();
            }
        } );
    }

    y.LoginRegister.Optional = optional;
} )()
