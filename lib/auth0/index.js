var Q = require('q');

module.exports = Auth0;

function Auth0(profileService, api, urls) {
    this.profileService = profileService;
    this.api = api;
    this.urls = urls;
}

Auth0.prototype.updateUser = function (userId, profile) {
    var deferred = Q.defer();

    this.api.put(this.urls.getAuth0Url(userId), profile, function (err, profile) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(profile);
        }
    });

    return deferred.promise;
};

Auth0.prototype.createUser = function (profile) {
    var deferred = Q.defer();

    this.api.post(this.urls.getAuth0Url(), profile, function (err, profile) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(profile);
        }
    });

    return deferred.promise;
};