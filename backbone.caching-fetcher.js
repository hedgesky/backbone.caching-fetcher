(function (window, $) {
  if (window.Backbone && !window.Backbone.CachingFetcher) {
    // constructor options:
    // onFetchStart(data):
    //  Function to call before all fetching processes start. Get object given to **fetch** method as param.
    // onSuccess(data)
    //  Function to call when all fetching processes are successfully finished. Get object given to **fetch** method as param.
    // onFail(data)
    //  Function to call when at least one of fetching processes fails. Get object given to **fetch** method as param.
    // onSingleSuccess(response)
    //  Function to call when item is successfully fetched. Get response on Backbone's **fetch** method.
    // onSingleFail(response)
    //  Function to call when item fetching fails. Get response on Backbone's **fetch** method.

    window.Backbone.CachingFetcher = function(options) {
      options = options || {};
      _.extend(this, options);

      // public

      // fetch(data) option description:
      // If **data.toFetch** is blank, whole data param is transformed to this object: `{toFetch: data}`.
      // data options structure:
      // toFetch:
      //   Array of items or single item to fetch. Item may be collection or model.
      // force:
      //   Fetch item even if it is already fetched.
      // success:
      //   Function without arguments to call when all fetching processes are successfully finished. It is called before constructor's **onSuccess** callback.
      // fail:
      //   Function without arguments to call at least one of fetching processes fails. It is called before constructor's **onFail** callback.

      this.fetch = function(data) {
        this.onFetchStart && this.onFetchStart(data);

        // for convenience
        data = prepareData(data);

        if (!(data.toFetch instanceof Array)) {
          data.toFetch = [data.toFetch];
        };

        // create deferreds for each item
        var allItemsDeffered = createFetchersDeferreds.call(this, data.toFetch, data.force);

        // bind callbacks
        var self = this;
        allItemsDeffered.done(function() {
          data.success && data.success();
          self.onSuccess && self.onSuccess(data);
        });

        allItemsDeffered.fail(function() {
          data.fail && data.fail();
          self.onFail && self.onFail(data);
        });

        return allItemsDeffered.promise();
      };

      // set force to true
      this.refetch = function(data) {
        // call "prepareData" explicitly to convert given data to object
        data = prepareData(data);
        data.force = true;
        return this.fetch(data);
      };

      // private

      // create array of deferred for every item in toFetch array
      var createFetchersDeferreds = function(toFetch, force) {
        var deferreds = _.map(toFetch, function(item){
          return fetchItem.call(this, item, force);
        }, this);

        return $.when.apply($, deferreds);
      };

      var fetchItem = function(item, force) {
        if (item._fetched && !force) {
          // immediately resolve deferred for already fetched items
          return resolvedDeferred();
        } else {
          return prepareFetchingDeferred.call(this, item);
        }
      };

      var prepareFetchingDeferred = function(item) {
        var deferred = item.fetch();

        deferred.done(function() {
          item._fetched = true;
        });

        this.onSingleSuccess && deferred.done(this.onSingleSuccess);
        this.onSingleFail && deferred.fail(this.onSingleFail);

        return deferred.promise();
      };

      var resolvedDeferred = function() {
        return $.Deferred().resolve();
      };

      var prepareData = function(data) {
        if (!data.toFetch) {
          data = {toFetch: data}
        }
        return data;
      };
    };

  }
}(window, $));