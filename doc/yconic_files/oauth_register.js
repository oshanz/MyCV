( function() {
    var oauth_register = {};

    oauth_register.TriggerOauthRegisterOverlay = function( e ) {
        if( e ) {
            e.preventDefault();
        }
        $( ".js-login_register-login_form" ).hide();
        $( ".js-login_register-optional_form" ).hide();
        $( ".js-login_register-register_form" ).hide();
        $( ".js-login_register-oauth_register_form" ).show();
        $( ".js-login_register-overlay_content" ).data( "marker-overlay", "OAUTH_REGISTER_OVERLAY");
        $( ".js-login_register-overlay_content" ).find( ".js-modal_overlay-close" ).show();
        y.Modal.Trigger( $( ".js-login_register-overlay_content" ) );
        ga( 'send', 'pageview', "#oauth_register_overlay" );
    }

    oauth_register.SubmitRegistration = function() {
        var inputs = $( ".js-login_register-oauth_register_inputs" ).find( "input, checkbox" );
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

        data.DateOfBirth = y.Datepicker.Get( "oauth_date_of_birth" );

        data.OauthProvider = y.Util.GetQueryString( "oauth_provider" )
        data.Token = y.Util.GetQueryString( "token" )

        var error_occurred = false;

        if( error_occurred ) {
            return $.Deferred().resolve();
        }

        return y.Util.Post( "/register/oauth", data ).done( function( result ) {
            result = result.register;
            if( result && result.IsCaiFailure ) {
                _.each( result.FailureItems, function( elem ) {
                    if( elem.FailureMessage === "invalid_date" ) {
                        $( ".js-datepicker" ).trigger( "error", "error-date_required" );
                    } else if( elem.FailureMessage === "too_young" ) {
                        $( ".js-login_register-oauth_register_form .js-datepicker" ).trigger( "error", "error-too_young" );
                    } else if( elem.FailureMessage === "missing name" ) {
                        inputs.trigger( "error", "error-name_required" );
                    } else if( elem.FailureMessage === "email address in use" ) {
                        $( ".js-login_register-oauth_register" ).trigger( "progress_complete" ).remove();
                        $( ".js-login_register-oauth_register-email_in_use" ).show();
                    }
                } );
            } else {
                y.LoginRegister.Optional.TriggerOptionalOverlay( result.member_id, $( "#login_register-oauth_subscribe_to_email" ).prop( "checked" ) )
            }
        } );
    }

    oauth_register.InitKeypressHandler = function() {
        $( ".js-login_register-inputs" ).on( "keydown", function( e ) {
            if( e.which === 13 ) {
                $( ".js-login_register-oauth_register" ).click();
            }
        } );
    }

    y.LoginRegister.OauthRegister = oauth_register;
} )()
