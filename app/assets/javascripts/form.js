YUI().use('autocomplete', function (Y) {
    var acNode = Y.one('#essay_location');

    acNode.plug(Y.Plugin.AutoComplete, {
        // Highlight the first result of the list.
        activateFirstItem: true,

        // The list of the results contains up to 10 results.
        maxResults: 10,

        // To display the suggestions, the minimum of typed chars is five.
        minQueryLength: 3,

        // Number of milliseconds to wait after user input before triggering a
        // `query` event. This is useful to throttle queries to a remote data
        // source.
        queryDelay: 500,

        // Handling the list of results is mandatory, because the service can be
        // unavailable, can return an error, one result, or an array of results.
        // However `resultListLocator` needs to always return an array.
        resultListLocator: function (response) {
            console.log(response);
            // Makes sure an array is returned even on an error.
            if (response.error) {
                return [];
            }

            var query = response.query.results.json,
                addresses;

            if (query.status !== 'OK') {
                return [];
            }

            // Grab the actual addresses from the YQL query.
            addresses = query.results;

            // Makes sure an array is always returned.
            return addresses.length > 0 ? addresses : [addresses];
        },

        // When an item is selected, the value of the field indicated in the
        // `resultTextLocator` is displayed in the input field.
        resultTextLocator: 'formatted_address',

        // {query} placeholder is encoded, but to handle the spaces correctly,
        // the query is has to be encoded again:
        //
        // "my address" -> "my%2520address" // OK => {request}
        // "my address" -> "my%20address"   // OK => {query}
        requestTemplate: function (query) {
            return encodeURI(query);
        },

        // {request} placeholder, instead of the {query} one, this will insert
        // the `requestTemplate` value instead of the raw `query` value for
        // cases where you actually want a double-encoded (or customized) query.
        source: 'SELECT * FROM json WHERE ' +
                    'url="http://maps.googleapis.com/maps/api/geocode/json?' +
                        'sensor=false&' +
                        'address={request}"',

        // Automatically adjust the width of the dropdown list.
        width: 'auto'
    });

    // Adjust the width of the input container.
    acNode.ac.after('resultsChange', function () {
        var newWidth = this.get('boundingBox').get('offsetWidth');
        acNode.setStyle('width', Math.max(newWidth, 100));
    });

    function getZoom(loc) {
      var GLOBE_WIDTH = 256,
        west = loc.southwest.lng,
        east = loc.northeast.lng,
        angle = east - west,
        zoom;

      if (angle < 0) {
        angle += 360;
      }

      zoom = Math.round(Math.log(300 * 360 / angle / GLOBE_WIDTH) / Math.LN2);

      return zoom;
    }

    // Fill the `lat` and `lng` fields when the user selects an item.
    acNode.ac.on('select', function (e) {
        var location = e.result.raw.geometry.location, zoom;

        zoom = getZoom(e.result.raw.geometry.bounds);

        Y.one('#essay_lat').set('value', location.lat);
        Y.one('#essay_lng').set('value', location.lng);
        Y.one('#essay_map_zoom_level').set('value', zoom);
        Y.one('#map-image img').set('src', 'http://maps.googleapis.com/maps/api/staticmap?center=' + location.lat + ',' + location.lng + '&zoom=' + zoom + '&size=300x200&sensor=false').show();
    });
});

YUI().use("sortable", function(Y){
    var sortable = new Y.Sortable({
        container: '.sorts.photos',
        nodes: 'li',
        opacity: '.5'
    });
});