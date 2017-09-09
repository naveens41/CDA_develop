function getLocale() {
    var path = location.pathname;
    if (path && (path.charAt(0) === '/') && (path.charAt(6) === '/') && (path.charAt(3) === '-')) {
        return path.substr(1, 5);
    }
    return path;
};

var loadUhfCss = function(uhfData, callback) {
    if (!uhfData || !uhfData.cssIncludes || !uhfData.cssIncludes.length) {
        return;
    }

    if (document.createStyleSheet) {
        //IE10 support
        for (i = 0; i < uhfData.cssIncludes.length; i++) {
            document.createStyleSheet(uhfData.cssIncludes[i]);
        }
    } else {
        var $head = $("head");
        for (i = 0; i < uhfData.cssIncludes.length; i++) {
            $head.append($('<link rel="stylesheet" href="' + uhfData.cssIncludes[i] + '" type="text/css" media="all" />'));
        }
    }

    //workaround to get css read callback
    var cssUrl = uhfData.cssIncludes[0];
    var img = document.createElement('img');
    img.onerror = function() {
        if (callback) {
            callback(uhfData);
        }
    }
    img.src = cssUrl;
}

var getUhfData = function() {
    //retrieve header id
    var uhfHeaderId = 'DEV_Homeheader';
    var uhfFooterId = 'DEV_HomeFooter';
    var partnerId = 'DEV_Home';

    var uhfUrl = 'https://docs.microsoft.com/api/GetUHF?locale=' + getLocale() + '&headerId=' + uhfHeaderId + '&footerId=' + uhfFooterId + '&partnerId=' + partnerId;

    $.ajax({
            url: uhfUrl,
            dataType: 'json',
            timeout: 10000
        })
        .done(function(data, textStatus, jqXHR) {
            var uhfData = jqXHR.responseJSON;
            loadUhfCss(uhfData, function(uhfData) {
                $(function() {
                    $('#uhfPlaceHolder').replaceWith($(uhfData.headerHTML));

                    //cancel Search Suggestions
                    var shellOptions = {
                        as: {
                            callback: function() {}
                        }
                    };

                    if (window.msCommonShell) {
                        window.msCommonShell.load(shellOptions);
                    } else {
                        window.onShellReadyToLoad = function() {
                            window.onShellReadyToLoad = null;
                            window.msCommonShell.load(shellOptions);
                        };
                    }
                });
            });
        });
};
getUhfData();
