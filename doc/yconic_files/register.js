( function() {
    var register = {};

    register.TriggerRegisterOverlay = function( e ) {
        if( e ) {
            e.preventDefault();
        }
        $( ".js-login_register-login_form" ).hide();
        $( ".js-login_register-optional_form" ).hide();
        $( ".js-login_register-oauth_register_form" ).hide();
        $( ".js-login_register-register_form" ).show();
        $( ".js-login_register-overlay_content" ).data( "marker-overlay", "REGISTER_OVERLAY");
        $( ".js-login_register-overlay_content" ).find( ".js-modal_overlay-close" ).show();
        y.Modal.Trigger( $( ".js-login_register-overlay_content" ) );
        ga( 'send', 'pageview', "#register_overlay" );
    }

    register.SubmitRegistration = function() {
        var inputs = $( ".js-login_register-register_inputs" ).find( "input, checkbox" );
        inputs.trigger( "clear_errors" );
        var data = {};
        inputs.each( function( i, elem ) {
            elem = $( elem );
            if( elem.data( "in_datepicker" ) ) {
                return
            }

            var key = elem.attr( "name" );
            var value = elem.val();
            if( elem.is( "input:checkbox" ) ) {
                value = elem.prop( "checked" );
            }
            data[key] = value;
        } );

        data.DateOfBirth = y.Datepicker.Get( "date_of_birth" );

        var error_occurred = false;

        if( error_occurred ) {
            return $.Deferred().resolve();
        }

        return y.Util.Post( "/register", data ).done( function( result ) {
            result = result.register;
            if( result && result.IsCaiFailure ) {
                _.each( result.FailureItems, function( elem ) {
                    if( elem.FailureMessage === "invalid email address" ) {
                        inputs.trigger( "error", "error-email_required" );
                    } else if( elem.FailureMessage === "invalid_date" ) {
                        $( ".js-datepicker" ).trigger( "error", "error-date_required" );
                    } else if( elem.FailureMessage === "too_young" ) {
                        $( ".js-login_register-register_form .js-datepicker" ).trigger( "error", "error-too_young" );
                    } else if( elem.FailureMessage === "password_too_short" ) {
                        inputs.trigger( "error", "error-password_too_short" );
                    } else if( elem.FailureMessage === "missing name" ) {
                        inputs.trigger( "error", "error-name_required" );
                    } else if( elem.FailureMessage === "email address in use" ) {
                        inputs.trigger( "error", "error-email_in_use" );
                    }
                } );
            } else {
                y.LoginRegister.Optional.TriggerOptionalOverlay( result.member_id, $( "#login_register-subscribe_to_email" ).prop( "checked" ) )
            }
        } );
    }

    register.InitKeypressHandler = function() {
        $( ".js-login_register-inputs" ).on( "keydown", function( e ) {
            if( e.which === 13 ) {
                $( ".js-login_register-register" ).click();
            }
        } );
    }

    y.LoginRegister.Register = register;
} )()
