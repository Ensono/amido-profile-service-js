var EventEmitter = require('events').EventEmitter,
    Api = require('./lib/api'),
    Q = require('q'),
    Auth0 = require('./lib/auth0'),
    Urls = require('./lib/urls'),
    ocreate = require('./lib/object-create');

module.exports = AmidoProfileService;


/**
 * Instantiate an instance of the profile service SDK
 * @param config
 *  @property {string} subscriptionKey
 * @return {AmidoProfileService}
 * @constructor
 */
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

    this.subscriptionKey = config.subscriptionKey;
    this.urls = new Urls(config.subscriptionKey);

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

/**
 * Create a profile for an existing user within the specified realm
 * @param userId - the user's ID
 * @param realm - the realm to create the profile
 * @param delegateToken - the user's access token to authorize with the API
 * @param profile - the JSON profile to save
 * @return {Promise} - resolved with the profile if successful.
 */
AmidoProfileService.prototype.createProfile = function (userId, realm, delegateToken, profile) {
    var deferred = Q.defer();

    this.api.post.call(this, this.urls.createProfile(userId, realm), profile, function (error, profile) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(profile);
        }
    }, delegateToken);

    return deferred.promise;
};

/**
 * Update the profile of an existing user within the specified realm
 * @param userId - the user's ID
 * @param realm - the realm to create the profile
 * @param delegateToken - the user's access token to authorize with the API
 * @param profile - the JSON profile to save
 * @return {Promise} - resolved with the profile if successful.
 */
AmidoProfileService.prototype.updateProfile = function (userId, realm, delegateToken, profile) {
    var deferred = Q.defer();

    this.api.put.call(this, this.urls.createProfile(userId, realm), profile, function (error, profile) {
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
 * @returns {Promise} - Resolved with the fieldset
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

/**
 * Get a user's profile for a specific schema
 * @param userId - the user's ID
 * @param realm - the realm to create the profile
 * @param delegateToken - the user's access token to authorize with the API
 * @return {Promise} - resolved with the user's profile
 */
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

/**
 * Is a profile complete for a given user
 * @param userId - the user's ID
 * @param realm - the realm to create the profile
 * @param delegateToken - the user's access token to authorize with the API
 * @return {Promise} - resolved with the result object
 */
AmidoProfileService.prototype.isProfileComplete = function (userId, realm, delegateToken) {
    var deferred = Q.defer();

    this.api.get.call(this, this.urls.isProfileComplete(userId, realm), function (error, result) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(result);
        }
    }, delegateToken);

    return deferred.promise;
};

/**
 * Return a user's nested profile. If a user's profile has a parent profile, will also be returned.
 * @param userId - the user's ID
 * @param realm - the realm to create the profile
 * @param delegateToken - the user's access token to authorize with the API
 * @return {Promise} - resolved with the user's nested profile
 */
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

/**
 * Update a user's profile for their identity provider, defined by the identityProvider set in the constructor (if provided)
 * @param userId - the user's ID
 * @param profile - the profile to update
 * @return {Promise} - resolved with the profile if successful
 */
AmidoProfileService.prototype.updateIdentityUser = function(userId, profile) {
    return this.identityProvider.updateUser(userId, profile);
};

/**
 * Create a new user profile with their identity provider, defined by the identityProvider set in the constructor (if provided)
 * @param profile - the profile to save
 * @return {Promise} - resolved with the profile if successful
 */
AmidoProfileService.prototype.createIdentityUser = function(profile) {
    return this.identityProvider.createUser(profile);
};
