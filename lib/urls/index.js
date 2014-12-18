module.exports = Urls;

function Urls(subscriptionKey) {
    if (!(this instanceof Urls)) {
        return new Urls(subscriptionKey);
    }

    this.baseUrl = 'https://amidouserprofile.azure-api.net/client/api/';
//    this.baseUrl = 'https://testamidouserprofile.azure-api.net/client/api/';

    this.subscriptionKey = subscriptionKey;
}

Urls.prototype.profileUrl = function(userId, realm) {
    return this.baseUrl + 'profiles/' + realm + '/' + userId;
};

Urls.prototype.nestedProfileUrl = function(userId, realm) {
    return this.baseUrl + 'nestedprofiles/' + realm + '/' + userId;
};

Urls.prototype.getSignupUrl = function() {
    return this.baseUrl + 'auth0/users/';
};

Urls.prototype.getAuth0Url = function(userId) {
    return this.baseUrl + 'auth0/users' + (userId ? ('/' + userId) : '');
};

Urls.prototype.createProfile = function(userId, realm) {
    return this.profileUrl(userId, realm);
};

Urls.prototype.getProfile = function(userId, realm) {
    return this.profileUrl(userId, realm);
};

Urls.prototype.isProfileComplete = function(userId, realm) {
    return this.baseUrl + 'profile/' + realm + '/' + userId + '/status';
}

Urls.prototype.getNestedProfile = function(userId, realm) {
    return this.nestedProfileUrl(userId, realm);
};

Urls.prototype.getSchema = function(realm, screenName) {
    return this.baseUrl + 'nestedfieldsets/' + realm + '/' + screenName;
};