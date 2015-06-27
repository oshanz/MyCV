( function() {
    var contents = {}
    y.Register( "Content", {
        "Add": function( key, value ) {
            contents[key] = value;
        },
        "Get": function( key ) {
            return contents[key];
        }
    } )
} )();