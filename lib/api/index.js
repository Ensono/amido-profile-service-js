var $ = require('jquery');

module.exports = Api;

function Api(subscriptionKey) {
    if (!(this instanceof Api)) {
        return new Api(subscriptionKey);
    }

    this.subscriptionKey = subscriptionKey;
}

var _callApi = function (options, callback) {
    $.ajax(options)
        .done(function (data) {
            callback.call(this, undefined, data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            var error = { xhr: jqXHR, status: jqXHR.status, textStatus: textStatus, error: errorThrown };
            console.log(error);
            callback.call(this, error, undefined);
        });
};

Api.prototype.get = function (url, callback, delegateToken) {
    var self = this;
    var options = {
        dataType: 'json',
        url: url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('ocp-apim-subscription-key', self.subscriptionKey);
            if (delegateToken) {
                xhr.setRequestHeader('x-zumo-auth', delegateToken);
            }
        }
    };

    _callApi.call(this, options, callback);
};

Api.prototype.put = function (url, data, callback, delegateToken) {

    var self = this;

    var payload = data && JSON.stringify(data) || JSON.stringify({});

    var options = {
        type: 'put',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: payload,
        url: url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('ocp-apim-subscription-key', self.subscriptionKey);
            if (delegateToken) {
                xhr.setRequestHeader('x-zumo-auth', delegateToken);
            }
        }
    };

    _callApi.call(this, options, callback);
};

Api.prototype.post = function (url, data, callback, delegateToken) {

    var self = this;

    var payload = data && JSON.stringify(data) || JSON.stringify({});

    var options = {
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: payload,
        url: url,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('ocp-apim-subscription-key', self.subscriptionKey);
            if (delegateToken) {
                xhr.setRequestHeader('x-zumo-auth', delegateToken);
            }
        }
    };

    _callApi.call(this, options, callback);
};