y.Register( "Datepicker", (function() {
    var datepicker = {};
    var datepickers = {};

    var this_year = new Date().getYear() + 1900;
    var this_month = new Date().getMonth();

    function addDays( element, date ) {
        if( !date ) {
            date = new Date();
        }

        date.setMonth( date.getMonth() + 1 );
        date.setDate( 0 );
        var days = date.getDate();

        var last_value = element.val();

        element.empty();
        element.append( "<option value=''>Day</option>" );
        for( var i = 1; i <= days; i++ ) {
            element.append( "<option value='" + i + "'>" + i + "</option>" );
        }

        element.val( last_value );

        if( y.Util.IsDesktop() ) {
            element.selectmenu( "refresh" );
        }
    }

    function addYears( element, max_year, min_year ) {
        element.empty();
        element.append( "<option value=''>Year</option>" );
        for( var i = max_year; i >= min_year; i-- ) {
            element.append( "<option value='" + i + "'>" + i + "</option>" );
        }
        if( y.Util.IsDesktop() ) {
            element.selectmenu( "refresh" );
        }
    }

    datepicker.Init = function( elem, data ) {
        data = _.extend( {
            "id": "",
            "max_year": new Date().getYear() + 1900,
            "min_year": 1930
        }, data );

        var day = elem.find( "select[name='day']" );
        var month = elem.find( "select[name='month']" );
        var year = elem.find( "select[name='year']" );

        if( y.Util.IsDesktop() ) {
            day.selectmenu( { "width": "100%" } );
            month.selectmenu( { "width": "100%" } );
            year.selectmenu( { "width": "100%" } );
        }

        addDays( day );

        addYears( year, data.max_year, data.min_year );

        month.on( "change selectmenuchange", function() {
            var numeric_year = ( year.val() === "" ? this_year : parseInt( year.val() ) );
            var numeric_month = ( month.val() === "" ? this_month : parseInt( month.val() ) - 1 );
            addDays( day, new Date( numeric_year, numeric_month, 1 ) );
        } );
        year.on( "change selectmenuchange", function() {
            var numeric_year = ( year.val() === "" ? this_year : parseInt( year.val() ) );
            var numeric_month = ( month.val() === "" ? this_month : parseInt( month.val() ) - 1 );
            addDays( day, new Date( numeric_year, numeric_month, 1 ) );
        } );

        datepickers[data.id] = elem;
        if( data.date ) {
            datepicker.SetDate( data.id, data.date );
        }
    }

    datepicker.Get = function( id ) {
        if( !id ) {
            id = "";
        }
        var elem = datepickers[id];

        var day = "" + elem.find( "select[name='day']" ).val();
        var month = "" + elem.find( "select[name='month']" ).val();
        var year = "" + elem.find( "select[name='year']" ).val();

        if( day === "" ) {
            return "invalid_date"
        }
        if( month === "" ) {
            return "invalid_month"
        }
        if( year === "" ) {
            return "invalid_year"
        }

        if( day.length != 2 ) {
            day = "0" + day;
        }

        if( month.length != 2 ) {
            month = "0" + month;
        }

        return year + "-" + month + "-" + day;
    }

    datepicker.SetDate = function( id, date ) {
        if( !id ) {
            id = "";
        }
        var elem = datepickers[id];

        var day = elem.find( "select[name='day']" );
        var month = elem.find( "select[name='month']" );
        var year = elem.find( "select[name='year']" );

        var components = date.split( "-" );
        if( components.length !== 3 ) {
            return
        }
        year.val( components[0] );
        month.val( "" + parseInt( components[1], 10 ) );
        day.val( "" + parseInt( components[2], 10 ) );

        if( y.Util.IsDesktop() ) {
            day.selectmenu( "refresh" );
            month.selectmenu( "refresh" );
            year.selectmenu( "refresh" );
        }
    }

    return datepicker;
} )() );