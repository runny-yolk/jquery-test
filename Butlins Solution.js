function changeStyle(){
    
    //Replaces the whatsOnLink id with a Class, so they can be selected as a group
    //I never ended up making use of this, deciding to reference each child via each one's parent instead
    //But I thought this loop was pretty nifty, nicely making use of chaining, JS DOM quirks, do/while, and falsy values
    //So I kept it anyway, but commented it out since it's not used.
    // do {
    //     $('#whatsOnLink').addClass('whatsOnLink')[0].id = ""
    // } while( $('#whatsOnLink')[0] )


    //Only divs with available bookings will have the big red button, so that's what it filters on.
    //After filtering, it cycles through the remaining ones to style their children
    $('.grid_3.alpha.omega').filter(function(){
        
        var item = $(this);

        if(item.find('.button.button-red')[0]){
            return true
        } else {
            return false
        }

    }).each(function(){

        var item = $(this);

        //Checks for comment, indicating selected item has already been styled, returns if so, to prevent this re-running if it doesn't have to
        if(item.html().indexOf('<!-- Styled. -->') == 0) return;

        //Adds comment to indicate the element's children have been styled
        item.html(function(i, html){
            return '<!-- Styled. -->' + html
        })

    
        //Exports items into variables for easier referral
        var link = item.find('a')[0];
        var bttn = item.find('.button.button-red');

        //Tweaks styling and adds newline, according to spec
        $(bttn).css('margin-top', '6px');
        $(link).css({'display':'block', 'margin-top':'5px'})
        $(bttn).after('<br/>', link)

        //Edge-case styling, for the Live Music Weekend boxes. Returns afterwards, since no other styling is needed on these
        if (item.hasClass('bigWeekends')) {
            $(bttn).css('margin', '12px auto');
            item.find('p').css({'line-height':'1.2', 'font-size':'15px'});
            return;
        }


        //Exports items into variables for easier referral
        var price = item.find('.latest-offer-price');
        var lightbox = item.find('.lightbox.lightbox-accomodation-more-info.lightbox-added');
        var text = item.find('.latest-type');


        //Extracts number from the HTML, multiplies, and places back in the HTML
        price.html(function(i, html){
            var text = html.replace('£', '');
            var num = parseInt(text, 10);
            num = num * 4;
            text = num.toString(10);
            text = '£'+text;
            return text;
        });
        //Adds a newline as per the spec
        price.after('<br/>');


        //Styling to the lightboxes (yellow question mark circles), as per the spec
        lightbox.css({'position':'absolute', 'top':'12px', 'right':'12px'});
        
        
        //Replaces pp with the text from the spec, removing extraneous span tags in the process
        //Also removes span tags from the price, to remove the styling, as per the spec
        text.html(function(i, html){
            html = html.replace('<span>pp</span>', '2 Adults, 2 Children');
            html = html.replace(/<span class="latest-offer-price">(.*?)<\/span>/i, '$1');
            
            return html
        })
        //Styles the text as per the spec
        text.css({'line-height':'1.2', 'margin-top': '4px', 'font-size':'15px'})

        //Edge case: styles the text to fit within the "BEST VALUE" boxes
        if(item.hasClass('cheapest')) {
            text.css({'margin-top':'1px', 'font-size':'13px'})
        }
        
    })
}

//Applies the new style
changeStyle();


//This seems to be the main function for retrieving the data displayed on this page
//Which means it's executed whenever filters are applied
//So here I redefine the function, with the exact same code as the original (copy+pasted from js file)
//But this time, it has changeStyle at the bottom
//So when filters are applied, so is the new style

//I wanted to just create a new function to replace getPriceMatrix, that would execute both getPriceMatrix (under a different name of course) and changeStyle
//To have cleaner code to paste into the console
//However, this throws an error when getPriceMatrix tries to do "var self = this;" Not unexpected, but it was worth a try anyway
//And even then, I doubt it'd actually work, as I've had to put my function call in what looks like a callback for an AJAX request
//If my function call was outside the AJAX callback, it would execute before the new data is loaded, and change nothing

butlins.getPriceMatrix = function (container, url, dates) {
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

    var self = this;
    self.ajaxPage(url, function (data) {
        var $content = $(data);
        var $data = $content.find('#matrix');

        // Set all dates to be the same
        var newDate = $data.find("#startValue").val();
        var individual = $data.find('#individualDate').val();
        var parts = newDate.split('/');
        if (individual == "true") {
            container.parent().find(self.settings.priceMatrix.date).val(newDate);
            if (isMobile == true) {
                container.parent().find(self.settings.priceMatrix.month).val(parts[1] + '/' + parts[2]);
            }
            else {
                container.parent().find(self.settings.priceMatrix.month).val(parts[1] + '/' + parts[2]).styliseSelect('sync');
            }
        } else {
            var $picker = container.parent().find(self.settings.priceMatrix.date);
            $picker.val('');
            $picker.datepicker('option', 'defaultDate', new Date(parseInt(parts[1], 10), parseInt(parts[0], 10) - 1, 1));

            if (isMobile == true) {
                container.parent().find(self.settings.priceMatrix.month).val(newDate);
            }
            else {
                container.parent().find(self.settings.priceMatrix.month).val(newDate).styliseSelect('sync');
            }
        }
        // set the resort radios
        var resort = $data.find('#resortValue').val();
        var $resorts = container.parent().find(self.settings.priceMatrix.resorts);
        $resorts.filter('[value=' + resort + ']').attr('checked', true);
        $resorts.styliseInput('sync');

        // set the room radios
        var roomtype = $data.find('#roomTypeValue').val();
        var $roomtype = container.parent().find(self.settings.priceMatrix.roomtype);
        $roomtype.filter('[value=' + roomtype + ']').attr('checked', true);
        $roomtype.styliseInput('sync');

        // Set the durations checkboxes
        var $durations = container.parent().find(self.settings.priceMatrix.durations).attr('checked', false);
        var durations = $data.find('#durationsValue').val().split(' ');
        for (var i = 0; i < durations.length; i++) {
            $durations.filter('[value=' + durations[i] + ']').attr('checked', true);
        }
        var validDurations = $data.find('#validDurations').val().split(' ');
        $durations.each(function () {
            var $duration = $(this);
            if (validDurations.indexOf($duration.val()) >= 0) {
                $duration.removeAttr('disabled').parent().css('opacity', '1.0').removeClass('unselectable');
            } else {
                $duration.attr('disabled', true).parent().css('opacity', '0.5');
            }
        });

        $durations.styliseInput('sync');

        // Set the food checkbox
        var resort = $data.find('#foodValue').val();
        container.parent().find(self.settings.priceMatrix.food).attr('checked', resort === "true").styliseInput('sync');

        // Change terms if food has changed
        var $terms = $content.find('div.grid-footer');
        container.parent().find('div.grid-footer').html($terms.html());

        // Scroll to the top
        // Changed scrollTop for Butlins-777 Dec 2013 as double scroll happens otherwise
        // if ($('.last-viewed-break').length > 0){
        // }else{
        //     $('html, body').animate({ scrollTop: container.parents('.grid_planner').offset().top - 20 }, 'fast');
        // }

        var floater = container.find('.grid-header');
        // check if floating and if so stop it.
        if (floater.data('opts')) {
            floater.floatify('destroy');
        }

        // Set the HTML
        container.html($data.html());

		// Set selected criteria text
        var filtered = $('.selected-criteria');
        var selectedCriteriaText = $(data).find('#selected-criteria').html();
        filtered.html(selectedCriteriaText);

        // Restyle any selects
        if (isMobile == true) {
            $('select').not('#addresses, #ap-slides #resort-selector input').addClass('select mobileSelect');
        }
        else {
            container.find('select').styliseSelect();
        }

        self.initCommon();

        self.initPriceMatrixContainer(container);

        // remove sticky sidebar functionality

        container.parent().find(self.settings.priceMatrix.stickyPanel).stickySidebar('update');

        // probably useless but just in case
        container.find('.loading-overlay').hide();

        self.whatsOnHighlightBreak();

        // Re-initiates the fancybox function so that pop up appears after ajax call
        // bb sd BUT_12268-1406
        self.initLightboxes();
        
        changeStyle();
    });
};