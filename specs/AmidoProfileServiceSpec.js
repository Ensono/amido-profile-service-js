var AmidoProfileService = require('../');

describe('AmidoProfileService', function() {
    describe('#constructor', function() {
        it('should throw and error if subscription key isn\'t provided', function() {
            expect(function() { new AmidoProfileService(undefined, undefined); })
                .toThrow(new Error('The `subscriptionKey` attribute must be supplied'));
        });

        it('should throw and error if zumoApplication isn\'t provided', function() {
            expect(function() { new AmidoProfileService('sdfkjhskjdf', undefined); })
                .toThrow(new Error('The `zumoApplication` attribute must be supplied'));
        });
    });

    describe('#getSchema', function() {
        var service = null;

        beforeEach(function() {
            service = new AmidoProfileService('subKey', 'zumoApplication');
        });

        it('should return 1', function() {
            var jq = require('jquery');

            var callback = function(err, data) {

            };

            spyOn(jq, 'getJSON');

            service.getSchema('register', callback);

        });
    }) ;
});