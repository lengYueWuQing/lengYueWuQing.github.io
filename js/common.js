function doPost(event, data, page, head, sync) {
    var event = event || {};
    var head = head || {};
    var page = page || {};
    var data = data || {};
    var sync = sync || false;

    var request = {
        head: head,
        data: data,
        page: page
    };

    invokeEventMethod(event, "Request", [request, data]);

    $.ajax({
        url: POST_URL + "/json/" + event,
        type: "POST",
        crossDomain: true,
        cache: false,
        async: !sync,
        contentType: 'application/json; charset=UTF-8',
        data: JSON.stringify(request),
        dataType: "json",
        success: function(response, status, xhr) {
            invokeEventMethod(event, "Response", [response, data]);
        },
        error: function(xhr, status, exception) {
            invokeEventMethod(event, "Exception", [exception, xhr.status, status]);
        }
    });
}

var POST_URL = "http://127.0.0.1:8080";

function invokeEventMethod(event, method, arguments) {
    if (window[event + method] instanceof Function) {
        return window[event + method].apply(this, arguments);
    }
    return null;
}

function getMessage(response) {
    var message = "";
    if (response.ermes != null && response.ermes.length > 0) {
        
        for (var i = 0; i < response.ermes.length; i++) {
            if (i == response.ermes.length - 1) {
                message += response.ermes[i];
            } else {
                message += response.ermes[i] + "、";
            }
        }
       
    }

    return message;
}