(function () {
    var paths = {};

    //HANDLE JQUERY IF LOADED ALREADY TO AVOID OVERWRITING EXISTING JQUERY PROPERTIES AND PLUGINS
    //CHECK FOR OLD VERSIONS OF JQUERY
    var oldjQuery = !!(window.jQuery && !!window.jQuery.fn.jquery.match(/^1\.[0-4]/));

    //LOAD JQUERY IF NOT AVAILABLE OR BELOW MIN
    if (!window.jQuery || oldjQuery) {
        paths.jquery = [
            '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
            //If the CDN location fails, load from this location
            'jquery-1.8.3.min.js?v=1.8'
        ];
    } else {
        //REGISTER THE CURRENT JQUERY
        define('jquery', [], function () {
            return window.jQuery;
        });
    }

    //CONFIGURE REQUIRE JS
    require.config({
        paths: paths,
        waitSeconds: 45
    });

    //STAR JQUERY FUNCTION
    (function ($) {

        //START REQUIRE JS

        function style_forms() {
            $('form').jqTransform({ imgPath: '/sites/all/themes/lseg/images/jq-images/',
                replaceAll: false,
                replaceSelect: true,
                replaceCheckbox: false,
                replaceRadio: false,
                replaceTextarea: false,
                replaceInput: false,
                replaceButton: false,
                replaceFile: false
            });
            $('form').removeClass('jqtransformdone');
        }

        function style_datepicker_selects() {
            $('.ui-datepicker-title').jqTransform({ imgPath: '/sites/all/themes/lseg/images/jq-images/',
                replaceAll: false,
                replaceSelect: true,
                replaceCheckbox: false,
                replaceRadio: false,
                replaceTextarea: false,
                replaceInput: false,
                replaceButton: false,
                replaceFile: false
            });
            $('.ui-datepicker-title').removeClass('jqtransformdone');
            //Fix for Firefox bug in implementation of jq-transform script
            if ($('.jqTransformSelectWrapper > .jqTransformSelectWrapper').length) {
                $('.ui-datepicker-title > .ui-datepicker-year-jqT > div:not(.jqTransformSelectWrapper)').remove();
                $('.jqTransformSelectWrapper > .jqTransformSelectWrapper, .jqTransformSelectWrapper > .jqTransformSelectWrapper .jqTransformDropDown').css('width', '104px');
            }
        }

        if ($('.view-filters').length) {
            $('.view-filters .views-exposed-widgets > .views-exposed-widget:nth-child(2n)').addClass('odd');
        }


        //Call to JQtransform plugin for custom styling of form elements.
        if ($('form').length) {
            require(["jquery", "jq-transform"], function ($) {
                style_forms();
            });
        }

        $('body').bind('DOMSubtreeModified', function (e) {
            if ($('#ui-datepicker-div').length && !$('.ui-datepicker-title .jqTransformSelectWrapper').length) {
                require(["jquery", "jq-transform"], function ($) {
                    style_datepicker_selects();
                });
            }
        });

        Drupal.behaviors.events = {
            attach: function (context, settings) {
                $('#views-exposed-form-filtered-content-list-default').off('ajaxSuccess').ajaxSuccess(function () {
                    $('.view-filters .views-exposed-widgets > .views-exposed-widget:nth-child(2n)').addClass('odd');
                    style_forms();
                    addSearchTracking();
                    addReadMoreOnClick();
                    addLinkTracking('.view-content .node-document');
                    var $container = $('.view-filtered-content-list .view-content');
                    $container.imagesLoaded(function () {
                        $container.masonry({
                            columnWidth: 2,
                            gutterWidth: 5
                        });
                    });
                });

                $('#views-exposed-form-event-listing-block').off('ajaxSuccess').ajaxSuccess(function () {
                    $('.view-filters .views-exposed-widgets > .views-exposed-widget:nth-child(2n)').addClass('odd');
                    style_forms();
                    addReadMoreOnClick();
                    addSearchTracking();
                    var $container = $('.view-event-listing .view-content');
                    $container.imagesLoaded(function () {
                        $container.masonry({
                            columnWidth: 2,
                            gutterWidth: 5
                        });
                    });
                });
                $('#lseg-share-tools-history-form').off('ajaxSuccess').ajaxSuccess(function () {
                    if ($('html').hasClass('touch')) {
                        show_sharetools_results_on_mobile();
                    } else {
                        animate_in_sharetools_results();
                    }
                });

            }
        };

        function addSearchTracking() {
            $('.view-filtered-content-list form input[type=submit]').click(function(e) {
                // If the searchType variable has been set then use that, otherwise revert to the contents of the h1
                var searchTypeDefined = (typeof searchType !== 'undefined');
                var title = (searchTypeDefined && searchType.length > 0) ? searchType : $('h1:first').html();
                var kw = $('#edit-populate').val();
                if (kw.length > 0) {
                    kw = htmlEncode(kw);
                } else {
                    kw = '(none)';
                }
                dataLayer.push({
                    'searchType': title,
                    'searchTerm': kw
                });
                dataLayer.push({'event': 'virtualSearch|true'});
            });

            $('.view-event-listing form input[type=submit]').click(function(e) {
                dataLayer.push({'event': 'virtualSearch|true'});
            });
        }

        function addReadMoreOnClick() {
            $('.field-name-node-link, .field-name-field-content-link').on('click', function(e){
                e.preventDefault();
                var $titleFieldLinks =  $(this).siblings('.field-name-title-field, .field-name-title').find('a');
                var target = $titleFieldLinks.attr('href');
                $titleFieldLinks.trigger('click');
                var isDoc = $(this).parents('div.node-document').length > 0;
                if (isDoc) {
                    // Open in new tab
                    window.open(target);
                } else {
                    document.location.href=target;
                }
            });
        }

        function addLinkTracking(baseSelector) {
            var linkSelector = '';
            if (baseSelector) {
                linkSelector = baseSelector + ' ';
            }
            linkSelector += 'a';
            //PICK UP EMAIL AND DOCUMENT LINK CLICK EVENTS
            $(linkSelector).each(function () {
                var href = $(this).attr('href');
                if (href && href.indexOf('mailto') == 0 && dataLayer) {
                    $(this).click(function () {
                        var email = $(this).attr('href');
                        email = email.replace('mailto:', '');
                        dataLayer.push({'event': 'Conversion|Email: ' + email + '|Email'});
                    });
                } else if (href) {
                    var fileLinkExp = /\.(pdf|doc|docx|xls|xlsx|zip|ppt)$|documents\/.*-(pdf|doc|docx|xls|xlsx|zip|ppt)$/;
                    if (fileLinkExp.test(href.toLowerCase())) {
                        $(this).click(function () {
                            var href = $(this).attr('href');
                            var title = $(this).html();
                            title = cleanUpTitle(title);

                            if (!title || title.length == 0) {
                                var filename = href.match(/\/([a-zA-Z0-9\.\-%]*)$/);
                                title = filename[0];
                            }
                            var matched_type = href.match(/(\.|-)([a-zA-Z0-9]*)$/);
                            var type = matched_type[2].toUpperCase();
                            dataLayer.push({'event': 'Engaged Action|'+type+': ' + title + '|Document View'});
                        });
                    }
                }
            });

        }

        function cleanUpTitle(title) {
            // Strip any tags out of the title
            title = title.replace(/(<([^>]+)>.*<([^>]+)>)/ig,"");

            return title;
        }

        addSearchTracking();
        addReadMoreOnClick();
        addLinkTracking();

        function animate_in_sharetools_results() {
            if ($('#lseg_value_of_shares').length) {
                if ($('#lseg_value_of_shares').children('div').length) {
                    $('#lseg_value_of_shares').animate({
                        height: '88px'
                    });
                }
            }
            if ($('#lseg_share_price_on').length) {
                if ($('#lseg_share_price_on').children('div').length) {
                    $('#lseg_share_price_on').animate({
                        height: '88px'
                    });
                }
            }
            if ($('#lseg_change_results').length) {
                if ($('#lseg_change_results').children().length) {
                    $('#lseg_change_results').animate({
                        height: '258px'
                    });
                }
            }

        }

        function show_sharetools_results_on_mobile() {
            if ($('#lseg_value_of_shares').length) {
                if ($('#lseg_value_of_shares').children('div').length) {
                    $('#lseg_value_of_shares').css({
                        height: '88px'
                    });
                }
            }
            if ($('#lseg_share_price_on').length) {
                if ($('#lseg_share_price_on').children('div').length) {
                    $('#lseg_share_price_on').css({
                        height: '88px'
                    });
                }
            }
            if ($('#lseg_change_results').length) {
                if ($('#lseg_change_results').children().length) {
                    $('#lseg_change_results').css({
                        height: '258px'
                    });
                }
            }

        }

        var slide_time; //This is used to deactivate the sliders on touch devices.

        if ($('#main-promotion-1').length) {
            require(["jquery", "cycle"], function ($) {
                if ($('html').hasClass('touch')) {
                    slide_time = 0;
                } else {
                    slide_time = 7000;
                }
                if (oldjQuery) $.noConflict(true);
                $('#main-promotion-1').parent().append('<div id="main-promotion-1-nav-wrapper"><div id="main-promotion-1-nav"></div><div id="main-promotion-1-pause"></div></div>');
                $('#main-promotion-1').cycle({
                    slideExpr: 'li',
                    fx: 'scrollLeft',
                    fit: false,
                    slideResize: false,
                    timeout: slide_time,
                    pager: '#main-promotion-1-nav'
                });
                $('#main-promotion-1 li').addClass('vis');

                if ($('#main-promotion-1 li').length < 2) {
                    $('#main-promotion-1').addClass('inactive');
                }

                $('#main-promotion-1-pause').click(function () {
                    if ($(this).hasClass('paused')) {
                        $(this).removeClass('paused');
                        $('#main-promotion-1').cycle('resume');
                    } else {
                        $(this).addClass('paused');
                        $('#main-promotion-1').cycle('pause');
                    }

                });
            });
        }

        if ($('.node-mega-menu-container').length) {
            require(["jquery", "jquery.masonry.min"], function ($) {
                if (oldjQuery) $.noConflict(true);
                var $container = $('.node-mega-menu-container .field-name-field-links > .field-items');
                $container.imagesLoaded(function () {
                    $container.masonry({
                        columnWidth: 3,
                        gutterWidth: 5
                    });
                });
            });
        }

        if ($('.field-name-field-unlimited-pods-inner').length) {
            require(["jquery", "jquery.masonry.min"], function ($) {
                if (oldjQuery) $.noConflict(true);
                var $container = $('.field-name-field-unlimited-pods-inner');
                $container.imagesLoaded(function () {
                    $container.masonry({
                        columnWidth: 300,
                        gutterWidth: 19
                    });
                });
            });
        }

        if ($('.view-filtered-content-list .view-content').length) {
            require(["jquery", "jquery.masonry.min"], function ($) {
                if (oldjQuery) $.noConflict(true);
                var $container = $('.view-filtered-content-list .view-content');
                $container.imagesLoaded(function () {
                    $container.masonry({
                        columnWidth: 300,
                        gutterWidth: 20
                    });
                });
            });
        }

        if ($('.view-event-listing .view-content').length) {
            require(["jquery", "jquery.masonry.min"], function ($) {
                if (oldjQuery) $.noConflict(true);
                var $container = $('.view-event-listing .view-content');
                $container.imagesLoaded(function () {
                    $container.masonry({
                        columnWidth: 2,
                        gutterWidth: 5
                    });
                });
            });
        }

        // Breadcrumb
        if ($('.breadcrumb').length) {
            require(["jquery", "breadcrumb-min"], function ($) {
                if (oldjQuery) $.noConflict(true);
                $('.breadcrumb').jBreadCrumb();
            });
        }

        //Fix for IE lack of column-count support
        if ($('html').hasClass('no-csscolumns')) {
            if ($('.node-homepage').length) {
                require(["jquery", "jquery-columnizer"], function ($) {
                    if (oldjQuery) $.noConflict(true);
                    $('.node-homepage .group-footer .field-name-body .field-item').columnize({
                        width: 330,
                        columns: 2
                    });
                });
            }
        }


        //HIDE URL BAR ON MOBILE DEVICES
        $(window).load(function () {
            window.scrollTo(0, 1);
        });


        //UNBIND UI DATEPICKER POPUP ON TOUCH DEVICES
        Drupal.behaviors.setDatePickerOptions = {
            attach: function (context, settings) {
                if ($('html').hasClass('touch')) {
                    setDatePickerOptions();
                }
            }
        };

        function setDatePickerOptions() {

            var format = "dd-mm-yyyy";
            if ($('body.node-type-share-tools').length > 0) {
                format = "dd/mm/yyyy";
            }

            for (var id in Drupal.settings.datePopup) {
                var $element = $('#' + id);
                $element.datepicker("destroy");
                $element.off('focus');
                $element.attr('placeholder', format);
            }
        }

        if ($('html').hasClass('touch')) {
            setDatePickerOptions();
        }

        function htmlEncode(value) {
            //create a in-memory div, set it's inner text(which jQuery automatically encodes)
            //then grab the encoded contents back out.  The div never exists on the page.
            return $('<div/>').text(value).html();
        }

    })(jQuery);

})();

  

 
 


   /* $(document).ready( function() {
		$('div#block-menu-block-1 li').each(function(){
			if($(this).hasClass('active-trail'))
				$(this).children('ul').find('li').addClass('active-trail');
				$(this).children('a.active-trail').addClass('accordionExpanded'); 
		}); 
		  
		$('div#block-menu-block-1 li').each(function(){ 
			if(!$(this).hasClass('active-trail'))
				$(this).addClass('inactive_trail'); 
		});
		 
		   
        $('div#block-menu-block-1 li.inactive_trail > ul').hide();     //hide all nested ul's 
        $('div#block-menu-block-1 li > ul li a[class=current]').parents('ul').show().prev('a').addClass('accordionExpanded');  //show the ul if it has a current link in it (current page/section should be shown expanded)
        $('div#block-menu-block-1 li:has(ul)').addClass('accordion');  //so we can style plus/minus icons   
        $('div#block-menu-block-1 li.inactive_trail:has(ul) > a').hover(function() { 
            $(this).toggleClass('accordionExpanded'); //for CSS bgimage, but only on first a (sub li>a's don't need the class)
            $(this).next('ul').slideToggle('slow');
            $(this).parent().siblings('li').children('ul:visible').slideUp('slow')
                $(this).parent('li').find('a').removeClass('accordionExpanded');
            return false;
        });
    });
*/