y.Register( "Carousel", ( function( slide_container, options ) {

    var default_options = {
        change_slides_every: 5000,
        move_speed: 200,
        autostart: true,
        next_callback: function() {},
        prev_callback: function() {},
        change_callback: function() {}
    }

    options = _.extend( default_options, options );

    var slides = slide_container.children();
    slides.css( "width", slide_container.width() );
    var timeout;

    slides.css( "float", "left" );
    slides.detach();

    var width = slide_container.width();
    var height = slide_container.height();

    var slider = $( "<div class='js-carousel-slider'></div>" );
    var prev_button = $( "<a role='button' class='js-carousel-prev carousel__prev'><</div>" );
    var next_button = $( "<a role='button' class='js-carousel-next carousel__next'>></div>" );

    prev_button.css( {
        "position": "absolute",
        "left": 0,
        "top": "50%",
        "margin-top": "-25px",
        "display": "none"
    } );

    next_button.css( {
        "position": "absolute",
        "right": 0,
        "top": "50%",
        "margin-top": "-25px",
        "display": "none"
    } );

    slider.css( {
        "position": "absolute",
        "left": 0,
        "top": 0,
        "width": width * slides.length,
        "height": height
    } );
    slider.append( slides );
    slide_container.append( slider );

    var index = 0;
    slide_container.css( {
        "overflow": "hidden",
        "position": "relative"
    } );

    this.Next = function() {
        var position = slider.position().left - width;
        if( position < -( slider.width() - width ) ) {
            _.each( slider.children(), function( slide ) {
                slide = $( slide );
                if( slide.offset().left - slide_container.offset().left < 0 ) {
                    slide.detach();
                    slider.append( slide );
                    slider.css( { "left": slider.position().left + width } )
                }
            } );
            position = slider.position().left - width;
        }

        slider.animate( { "left": position }, options.move_speed );
        options.next_callback();
        options.change_callback();
    }

    this.Prev = function() {
        var position = slider.position().left + width;
        if( position >= 0 ) {
            _.each( slider.children(), function( slide ) {
                slide = $( slide );
                if( slide.offset().left - slide_container.offset().left > width ) {
                    slide.detach();
                    slider.prepend( slide );
                    slider.css( { "left": slider.position().left - width } )
                }
            } );
            position = slider.position().left + width;
        }

        slider.animate( { "left": position }, options.move_speed );
        options.prev_callback();
        options.change_callback();
    }

    this.Start = function() {
        var self = this;
        var auto_progress = function() {
            self.Next();
            setTimeout( auto_progress, options.change_slides_every );
        }

        timeout = setTimeout( auto_progress, options.change_slides_every );
    }

    this.Stop = function() {
        if( timeout ) {
            clearTimeout( timeout );
            timeout = null;
        }
    }

    if( options.autostart ) {
        this.Start();
    }
} ) );