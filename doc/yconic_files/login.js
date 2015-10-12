y.Register( "LoginRegister", {} );
( function() {
    var login = {};

    login.TriggerLoginOverlay = function( e ) {
        if( e ) {
            e.preventDefault();
        }
        $( ".js-login_register-register_form" ).hide();
        $( ".js-login_register-oauth_register_form" ).hide();
        $( ".js-login_register-optional_form" ).hide();
        $( ".js-login_register-login_form" ).show();
        $( ".js-login_register-overlay_content" ).data( "marker-overlay", "LOGIN_OVERLAY");
        $( ".js-login_register-overlay_content" ).find( ".js-modal_overlay-close" ).show();
        y.Modal.Trigger( $( ".js-login_register-overlay_content" ) );
        ga( 'send', 'pageview', "#login_overlay" );
    }

    login.SubmitLogin = function() {
        var inputs = $( ".js-login_register-login_inputs" ).find( "input, checkbox" );
        inputs.trigger( "clear_errors" );
        var data = {};
        inputs.each( function( i, elem ) {
            elem = $( elem );
            var key = elem.attr( "name" );
            var value = elem.val();
            if( elem.is( "input:checkbox" ) ) {
                value = elem.prop( "checked" );
            }
            data[key] = value;
        } );

        var error_occurred = false;
        if( $.trim( data.LoginId ) === "" ) {
            $( ".js-login_register-login_inputs" ).find( "input, checkbox" ).trigger( "error", "error-login_id_required" );
            error_occurred = true;
        }

        if( $.trim( data.Password ) === "" ) {
            $( ".js-login_register-login_inputs" ).find( "input, checkbox" ).trigger( "error", "error-password_required" );
            error_occurred = true;
        }

        if( error_occurred ) {
            return $.Deferred().resolve();
        }

        var error_result = $.Deferred();

        y.Util.Post( "/login", data ).done( function( result ) {
            if( result.result && !result.result.LoginSuccess ) {
                inputs.trigger( "clear_errors" );
                inputs.trigger( "error", "error-wrong_password" );
                error_result.resolve();
            } else {
                window.location.reload();
            }
        } );
        return error_result;
    }

    login.InitKeypressHandler = function() {
        $( ".js-login_register-login_inputs" ).on( "keydown", function( e ) {
            if( e.which === 13 ) {
                $( ".js-login_register-log_in" ).click();
            }
        } );
    }

    y.LoginRegister.Login = login;
} )()
