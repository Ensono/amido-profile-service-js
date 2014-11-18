# Amido Profile Service

## Usage


    // Create an options hash to pass to the profile service
    var profileOptions = {
        subscriptionKey: '<your key here>', // represents your Amido Profile Service subscription key,
        realm: 'my.realm.com' // the realm that your profiles should be saved against
    };
  
    var profileService = new AmidoProfileService(profileOptions);