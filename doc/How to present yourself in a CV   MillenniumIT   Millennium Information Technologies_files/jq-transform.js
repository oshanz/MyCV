// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

(function ($) {
    var jqTransformImgPreloaded = false;

    var jqTransformPreloadHoverFocusImg = function (strImgUrl) {
        //guillemets to remove for ie
        strImgUrl = strImgUrl.replace(/^url\((.*)\)/, '$1').replace(/^\"(.*)\"$/, '$1');
        var imgHover = new Image();
        imgHover.src = strImgUrl.replace(/\.([a-zA-Z]*)$/, '-hover.$1');
        var imgFocus = new Image();
        imgFocus.src = strImgUrl.replace(/\.([a-zA-Z]*)$/, '-focus.$1');
    };


    /***************************
    Labels
    ***************************/
    var jqTransformGetLabel = function (objfield) {
        var selfForm = $(objfield.get(0).form);
        var inputname = objfield.attr('id');
        var oLabel = $();
        if (inputname) oLabel = selfForm.find('label[for="' + inputname + '"]');
        if (!oLabel.is('label')) {
            oLabel = objfield.next();
            if (!oLabel.is('label')) {
                oLabel = objfield.prev();
                if (!oLabel.is('label')) oLabel = objfield.parent();
            }
        }
        if (oLabel.is('label')) return oLabel.css('cursor', 'pointer');
        return false;
    };

    // Hide all open selects
    var jqTransformHideSelect = function (oTarget) {
        var ulVisible = $('ul.jqTransformDropDown:visible');
        ulVisible.each(function () {
            var oSelect = $(this).data('wrapper').find("select").get(0);
            //do not hide if click on the label object associated to the select
            if (!(oTarget && oSelect.oLabel && oSelect.oLabel.get(0) == oTarget.get(0))) {
                $(this).hide();
                $('.jqTransformSelectWrapper').css({ zIndex: '' });
            }
        });
    };

    // GetPosition of element in page
    var jqOffset = function (obj) {
        var ol = ot = 0;
        if (obj.offsetParent) {
            do {
                ol += obj.offsetLeft;
                ot += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return { x: ol, y: ot };
    };

    // create new classes for jqt elements
    var newClasses = function (obj, extention) {
        var classes = obj.attr('class').split(' ');
        var returnString = '';
        for (var i = 0, len = classes.length; i < len; i++) {
            if (classes[i].length > 0) returnString += classes[i] + '-' + extention + ' ';
        }
        return returnString;
    }

    // Check for an external click 
    var jqTransformCheckExternalClick = function (event) {
        if ($(event.target).parents('.jqTransformDropDown').length === 0 && !$(event.target).hasClass('jqTransformDropDown') && $(event.target).parents('.jqTransformSelectWrapper').length === 0) { jqTransformHideSelect($(event.target)); }
    };

    // Apply document listener 
    var jqTransformAddDocumentListener = function () { $(document).mousedown(jqTransformCheckExternalClick); };

    // Add a new handler for the reset action 
    var jqTransformReset = function (f) {
        var sel;
        $('.jqTransformSelectWrapper select', f).each(function () { sel = (this.selectedIndex < 0) ? 0 : this.selectedIndex; $('ul', $(this).parent()).each(function () { $('a:eq(' + sel + ')', this).click(); }); });
        $('a.jqTransformCheckbox, a.jqTransformRadio', f).removeClass('jqTransformChecked');
        $('input:checkbox, input:radio', f).each(function () { if (this.checked) { $('a', $(this).parent()).addClass('jqTransformChecked'); } });
    };

    /***************************
    Buttons
    ***************************/
    $.fn.jqTransInputButton = function () {
        return this.each(function () {
            var newBtn = $('<button id="' + this.id + '" name="' + this.name + '" type="' + this.type + '" class="' + this.className + ' jqTransformButton"><span><span>' + $(this).attr('value') + '</span></span>')
				.hover(function () { newBtn.addClass('jqTransformButton_hover'); }, function () { newBtn.removeClass('jqTransformButton_hover') })
				.mousedown(function () { newBtn.addClass('jqTransformButton_click') })
				.mouseup(function () { newBtn.removeClass('jqTransformButton_click') })
			;
            $(this).replaceWith(newBtn);
        });
    };

    /***************************
    Text Fields 
    ***************************/
    $.fn.jqTransInputText = function () {
        return this.each(function () {
            var $input = $(this);

            if ($input.hasClass('jqtranformdone') || !$input.is('input')) return;
            $input.addClass('jqtranformdone');

            var oLabel = jqTransformGetLabel($(this));
            oLabel && oLabel.bind('click', function () { $input.focus(); });

            var inputSize = $input.width();
            if ($input.attr('size')) {
                inputSize = $input.attr('size') * 10;
                $input.css('width', inputSize);
            }

            $input.addClass("jqTransformInput").wrap('<div class="jqTransformInputWrapper"><div class="jqTransformInputInner"><div></div></div></div>');
            var $wrapper = $input.parent().parent().parent();
            $wrapper.css("width", inputSize + 10);
            $input
				.focus(function () { $wrapper.addClass("jqTransformInputWrapper_focus"); })
				.blur(function () { $wrapper.removeClass("jqTransformInputWrapper_focus"); })
				.hover(function () { $wrapper.addClass("jqTransformInputWrapper_hover"); }, function () { $wrapper.removeClass("jqTransformInputWrapper_hover"); })
			;

            // If this is safari we need to add an extra class 
            $.browser.safari && $wrapper.addClass('jqTransformSafari');
            $.browser.safari && $input.css('width', $wrapper.width() + 16);
            this.wrapper = $wrapper;
        });
    };

    /***************************
    Check Boxes 
    ***************************/
    $.fn.jqTransCheckBox = function () {
        return this.each(function () {
            if ($(this).hasClass('jqTransformHidden')) { return; }

            var $input = $(this);
            var inputSelf = this;

            //set the click on the label
            var oLabel = jqTransformGetLabel($input);
            oLabel && oLabel.click(function () { aLink.trigger('click'); });

            var aLink = $('<a href="#" class="jqTransformCheckbox"></a>');
            //wrap and add the link
            $input.addClass('jqTransformHidden').wrap('<span class="jqTransformCheckboxWrapper"></span>').parent().prepend(aLink);
            //on change, change the class of the link
            $input.change(function () {
                this.checked && aLink.addClass('jqTransformChecked') || aLink.removeClass('jqTransformChecked');
                return true;
            });

            aLink
				.keypress(function (e) {
				    if (e.charCode == 32 || e.keyCode == 32) {
				        aLink.click();
				        return false;
				    }
				})
				.click(function () {
				    //do nothing if the original input is disabled
				    if ($input.attr('disabled')) { return false; }
				    //trigger the envents on the input object
				    $input.trigger('click').trigger("change");
				    return false;
				});

            // set the default state
            this.checked && aLink.addClass('jqTransformChecked');
        });
    };
    /***************************
    Radio Buttons 
    ***************************/
    $.fn.jqTransRadio = function () {
        return this.each(function () {
            if ($(this).hasClass('jqTransformHidden')) { return; }

            var $input = $(this);
            var inputSelf = this;

            oLabel = jqTransformGetLabel($input);
            oLabel && oLabel.click(function () { aLink.trigger('click'); });

            var aLink = $('<a href="#" class="jqTransformRadio" rel="' + this.name + '"></a>');
            $input.addClass('jqTransformHidden').wrap('<span class="jqTransformRadioWrapper"></span>').parent().prepend(aLink);

            $input.change(function () {
                inputSelf.checked && aLink.addClass('jqTransformChecked') || aLink.removeClass('jqTransformChecked');
                return true;
            });

            aLink
				.keypress(function (e) {
				    if (e.charCode == 32 || e.keyCode == 32) {
				        aLink.click();
				        return false;
				    }
				})
            // Click Handler
				.click(function () {
				    if ($input.attr('disabled')) { return false; }
				    $input.trigger('click').trigger('change');

				    // uncheck all others of same name input radio elements
				    $('input[name="' + $input.attr('name') + '"]', inputSelf.form).not($input).each(function () {
				        $(this).attr('type') == 'radio' && $(this).trigger('change');
				    });

				    return false;
				});
            // set the default state
            inputSelf.checked && aLink.addClass('jqTransformChecked');
        });
    };

    /***************************
    TextArea 
    ***************************/
    $.fn.jqTransTextarea = function () {
        return this.each(function () {
            var textarea = $(this);

            if (textarea.hasClass('jqtransformdone')) { return; }
            textarea.addClass('jqtransformdone');

            oLabel = jqTransformGetLabel(textarea);
            oLabel && oLabel.click(function () { textarea.focus(); });

            var strTable = '<table cellspacing="0" cellpadding="0" border="0" class="jqTransformTextarea">';
            strTable += '<tr><td id="jqTransformTextarea-tl"></td><td id="jqTransformTextarea-tm"></td><td id="jqTransformTextarea-tr"></td></tr>';
            strTable += '<tr><td id="jqTransformTextarea-ml">&nbsp;</td><td id="jqTransformTextarea-mm"><div></div></td><td id="jqTransformTextarea-mr">&nbsp;</td></tr>';
            strTable += '<tr><td id="jqTransformTextarea-bl"></td><td id="jqTransformTextarea-bm"></td><td id="jqTransformTextarea-br"></td></tr>';
            strTable += '</table>';
            var oTable = $(strTable)
					.insertAfter(textarea)
					.hover(function () {
					    !oTable.hasClass('jqTransformTextarea-focus') && oTable.addClass('jqTransformTextarea-hover');
					}, function () {
					    oTable.removeClass('jqTransformTextarea-hover');
					})
				;

            textarea
				.focus(function () { oTable.removeClass('jqTransformTextarea-hover').addClass('jqTransformTextarea-focus'); })
				.blur(function () { oTable.removeClass('jqTransformTextarea-focus'); })
				.appendTo($('#jqTransformTextarea-mm div', oTable))
			;
            this.oTable = oTable;
            if ($.browser.safari) {
                $('#jqTransformTextarea-mm', oTable)
					.addClass('jqTransformSafariTextarea')
					.find('div')
						.css('height', textarea.height())
						.css('width', textarea.width())
				;
            }
        });
    };

    /***************************
    File inputs 
    ***************************/
    $.fn.jqTransFile = function () {
        return this.each(function () {
            var $fileupload = $(this).addClass('fileReplaced');
            var $wrapper = $fileupload
				.wrap('<div class="jqTransformFileUploadWrapper ' + newClasses($fileupload, 'jqT') + '"></div>')
				.css({ opacity: 0.01 })
				.parent()
				.css({ zIndex: '' });

            var $newButton = $('<button class="jqTransformButton" type="button"><span><span>' + $fileupload.attr('title') + '</span></span></button>');
            var $newField = $('<div class="jqTransformInputWrapper"><div class="jqTransformInputInner"><div><input type="text" /></div></div></div>')
            $wrapper.prepend($newField, $newButton);

            $newButton.find('>span>span').css({ width: 65 });

            $newField.css({ width: $fileupload.width() - $newButton.width() });

            $fileupload.css({ top: ($newButton.height() - $fileupload.height()) / 2 });

            $newButton.add($newField).click(function () { return false; });

            $fileupload.change(function () {
                $newField.find('input').val($(this).val());
            });

        });
    };

    /***************************
    Select 
    ***************************/
    $.fn.jqTransSelect = function () {
        

        return this.each(function (index) {
            if (!$('html').hasClass('touch')) {

                var $select = $(this);

                if ($select.hasClass('jqTransformHidden')) { return; }
                if ($select.attr('multiple')) { return; }

                var $posX = jqOffset(this).y;

                var oLabel = jqTransformGetLabel($select);
                // First thing we do is Wrap it 
                var $wrapper = $select
    				.wrap('<div class="jqTransformSelectWrapper ' + newClasses($select, 'jqT') + '"></div>')
    				.addClass('jqTransformHidden')
    				.parent()
    				.css({ zIndex: '' });

                // Now add the html for the select 
                $wrapper.prepend('<div><span class="jqTransformSelectBox"></span><a class="jqTransformSelectOpen" href="#"></a></div.');
                var $ul = $('<ul class="jqTransformDropDown ' + newClasses($select, 'jqT') + '"></ul>').data('wrapper', $wrapper).css('width', $select.width()).hide();
                $wrapper.append($ul);
                // Now we add the options 
                var options = $('option', this);
                options.each(function (i) { $ul.append($('<li><a href="#" index="' + i + '">' + $(this).html() + '</a></li>')); });

                // Add click handler to the a 
                $ul.find('a')
    				.keypress(function (e) {
    				    if (e.charCode == 32 || e.keyCode == 32) {
    				        $(this).click();
    				        return false;
    				    }
    				})
    				.click(function () {
    				    var theA = $(this);
    				    $('a.selected', $ul).removeClass('selected');
    				    theA.addClass('selected');
    				    // Fire the onchange event 
    				    if ($select[0].selectedIndex != theA.attr('index')) { $select[0].selectedIndex = theA.attr('index'); $select.change(); }
    				    $select[0].selectedIndex = theA.attr('index');
    				    $('.jqTransformSelectBox', $wrapper).html(theA.html());
    				    $ul.hide();
    				    $wrapper.css({ zIndex: '' });
    				    return false;
    				});

                // Set the default 
                $('a:eq(' + this.selectedIndex + ')', $ul).click();
                //$('span:first', $wrapper).click(function(){$(".jqTransformSelectOpen",$wrapper).click();});
                //oLabel && oLabel.click(function(){$(".jqTransformSelectOpen",$wrapper).click();});
                this.oLabel = oLabel;

                // Apply the click handler to the Open 
                var oLinkOpen = $('.jqTransformSelectOpen', $wrapper);

                if (options.length < 2) oLinkOpen.addClass('empty');

                oLinkOpen
    				.keypress(function (e) {
    				    if (e.keyCode == 38 || e.charCode == 38) {
    				        $ul.find('a.selected').parent().prev().find('a').click();
    				        return false;
    				    }
    				    else if (e.keyCode == 40 || e.charCode == 40) {
    				        $ul.find('a.selected').parent().next().find('a').click();
    				        return false;
    				    }
    				    else if (e.keyCode == 32 || e.charCode == 32) {
    				        oLinkOpen.trigger('click');
    				        return false;
    				    }
    				})
    				.mousedown(function () { oLinkOpen.addClass('jqTransformSelectClicked'); })
    				.mouseup(function () { oLinkOpen.removeClass('jqTransformSelectClicked'); })
    				.mouseleave(function () { oLinkOpen.removeClass('jqTransformSelectClicked'); })
    				.add($('.jqTransformSelectBox', $wrapper)).add(oLabel)
    				.click(function (e) {
    				    if (oLinkOpen.hasClass('empty')) return false;
    				    //Check if box is already open to still allow toggle, but close all other selects
    				    if ($ul.css('display') == 'none') jqTransformHideSelect();
    				    if ($select.attr('disabled')) return false;

    				    if (!$ul.is(':visible')) {
    				        $wrapper.css({ zIndex: 20 - index });
    				        $tempPosX = $posX - $(window).scrollTop();
    				        //if ($(window).height() - $tempPosX < $wrapper.height() + 150) $ul.css({top:'auto',bottom:$wrapper.offset().top, left:$wrapper.offset().left});
    				        //$ul.css({ top: $wrapper.offset().top + $wrapper.height(), bottom: 'auto', left: $wrapper.offset().left });

    				        $ul.slideDown('fast', function () { $ul.css({ scrollTop: $('a.selected', $ul).offset().top - $ul.offset().top }); });
    				    }
    				    else {
    				        $wrapper.css({ zIndex: '' });
    				        $ul.slideUp('fast');
    				    }


    				    return false;
    				});

                // Set the new width

                var iSelectWidth = $select.outerWidth() + 10;
                var oSpan = $('span:first', $wrapper);
                var newWidth = (iSelectWidth > oSpan.innerWidth()) ? iSelectWidth : $wrapper.width();
                $wrapper.css('width', newWidth);
                $ul.css('width', newWidth - 2);
                oSpan.css({ width: newWidth });

                // Calculate the height if necessary, less elements that the default height
                $ul.css({ display: 'block', visibility: 'hidden' });

                //The following code didn't work when the text of a list item wrapped on to 2 or more lines
                //Updated as of 02/05/2013 by d.parker
                //var iSelectHeight = ($('li', $ul).length) * ($('li:first', $ul).height()); //+1 else bug ff

                var li_height = 0;
                $(function(){
                    $('li', $ul).each(function(){
                        li_height += $(this).height();
                    });
                });
                var iSelectHeight = li_height;

                $ul.css({ height: iSelectHeight, 'overflow': 'hidden' }); //hidden else bug with ff
                $ul.css({ display: 'none', visibility: 'visible' });

            } else {
                
                var mt = $(this).css('margin-top');
                var mr = $(this).css('margin-right');
                var mb = $(this).css('margin-bottom');
                var ml = $(this).css('margin-left');
                $(this).wrap('<div class="mobile-select-wrapper" style="margin:' + mt + ' ' + mr + ' ' + mb + ' ' + ml + ';"></div>').after('<span class="mobile-select-icon"></span>').css('margin', '0');
            }
        });
    };

    // jqtransform constructor
    $.fn.jqTransform = function (options) {
        var opts = $.extend({}, $.fn.jqTransform.defaults, options);

        return this.each(function () {
            var selfForm = $(this);
            if (selfForm.hasClass('jqtransformdone')) return;
            selfForm.addClass('jqtransformdone');

            if (opts.replaceButton || opts.replaceAll) $('input:submit, input:reset, input[type="button"]', this).not(opts.noReplace).jqTransInputButton();
            if (opts.replaceInput || opts.replaceAll) $('input:text, input:password', this).not(opts.noReplace).jqTransInputText();
            if (opts.replaceCheckbox || opts.replaceAll) $('input:checkbox', this).not(opts.noReplace).jqTransCheckBox();
            if (opts.replaceRadio || opts.replaceAll) $('input:radio', this).not(opts.noReplace).jqTransRadio();
            if (opts.replaceFile || opts.replaceAll) $('input:file', this).not(opts.noReplace).jqTransFile();
            if (opts.replaceTextarea || opts.replaceAll) $('textarea', this).not(opts.noReplace).jqTransTextarea();

            if (opts.replaceSelect || opts.replaceAll) {
                if ($('select', this).not(opts.noReplace).jqTransSelect().length > 0) jqTransformAddDocumentListener();
            }

            selfForm.bind('reset', function () { var action = function () { jqTransformReset(this); }; window.setTimeout(action, 10); });
        });

    };

    $.fn.jqTransform.defaults = {
        preloadImg: true,
        replaceAll: false,
        replaceCheckbox: false,
        replaceSelect: false,
        replaceRadio: false,
        replaceTextarea: false,
        replaceInput: false,
        replaceButton: false,
        replaceFile: false,
        noReplace: ''
    }
})(jQuery);