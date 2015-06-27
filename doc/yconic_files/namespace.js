window.y = ( function() {
    var y = {};

    y.Register = function( name, value ) {
        if( y[name] ) {
            return false
        }
        y[name] = value;
        return true
    }

    return y;
} )();