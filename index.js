var EventEmitter = require('events').EventEmitter,
    Api = require('./lib/api'),
    Q = require('q'),
    Auth0 = require('./lib/auth0'),
    Urls = require('./lib/urls'),
    ocreate = require('./lib/object-create');

module.exports = AmidoProfileService;

function AmidoProfileService(config) {
    if (!(this instanceof AmidoProfileService)) {
        return new AmidoProfileService(config);
    }

    if (!config || typeof config !== 'object') {
        throw new Error('The `config` attribute must be supplied');
    }

    if (typeof config.subscriptionKey !== 'string') {
        throw new Error('The `subscriptionKey` attribute must be supplied');
    }

    if (typeof config.zumoApplication !== 'string') {
        throw new Error('The `zumoApplication` attribute must be supplied');
    }

    if (typeof config.realm !== 'string') {
        throw new Error('The `realm` attribute must be supplied');
    }


    this.zumoApplication = config.zumoApplication;
    this.subscriptionKey = config.subscriptionKey;
    this.urls = new Urls(config.subscriptionKey);
    this.realm = config.realm;

    this.api = new Api(config.subscriptionKey);

    switch (config.identityProvider || 'auth0') {
        case 'auth0':
            this.identityProvider = new Auth0(this, this.api, this.urls);
            break;
        default:
            this.identityProvider = new Auth0(this, this.api, this.urls);
    }
}

AmidoProfileService.version = require('./package').version;

AmidoProfileService.prototype = ocreate(EventEmitter.prototype);

AmidoProfileService.prototype.createProfile = function (user_id, realm, delegateToken, profile) {
    var deferred = Q.defer();

    this.api.post.call(this, this.urls.createProfile(user_id, realm), profile, function (error, profile) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(profile);
        }
    }, delegateToken);

    return deferred.promise;
};

AmidoProfileService.prototype.updateProfile = function (user_id, realm, delegateToken, profile) {
    var deferred = Q.defer();

    this.api.put.call(this, this.urls.createProfile(user_id, realm), profile, function (error, profile) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(profile);
        }
    }, delegateToken);

    return deferred.promise;
};

/**
 * Get the schema for a given field set
 *
 * @param {string} realm
 * @param {string} screenName - name of fieldset to load
 * @returns {Promise} -
 * @public
 */
AmidoProfileService.prototype.getFieldsets = function (realm, screenName) {
    var deferred = Q.defer();

    this.api.get.call(this, this.urls.getSchema(realm, screenName), function (error, fieldsets) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            delete fieldsets.path;
            deferred.resolve(fieldsets);
        }
    });

    return deferred.promise;
};

AmidoProfileService.prototype.getProfile = function (userId, realm, delegateToken) {
    var deferred = Q.defer();

    this.api.get.call(this, this.urls.getProfile(userId, realm), function (error, profile) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            delete profile.path;
            deferred.resolve(profile);
        }
    }, delegateToken);

    return deferred.promise;
};

AmidoProfileService.prototype.getNestedProfile = function (userId, realm, delegateToken) {
    var deferred = Q.defer();

    this.api.get.call(this, this.urls.getNestedProfile(userId, realm), function (error, profile) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            delete profile.path;
            deferred.resolve(profile);
        }
    }, delegateToken);

    return deferred.promise;
};

AmidoProfileService.prototype.updateIdentityUser = function(userId, profile) {
    return this.identityProvider.updateUser(userId, profile);
};

AmidoProfileService.prototype.createIdentityUser = function(profile) {
    return this.identityProvider.createUser(profile);
};

AmidoProfileService.prototype.getSignupUrl = function () {
    return this.urls.getSignupUrl();
};