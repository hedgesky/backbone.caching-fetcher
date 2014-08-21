# backbone.caching-fetcher

A Backbone plugin to cache results of fetching Backbone models and collections.

Main use case: if you have rarely changing set of collections or models that is required by different parts of your app, you could fetch it only once. Caching-fetcher relieve your from need of check whether any of item in the set was fetched or not.

# Usage

```
var caching_fetcher = new window.Backbone.CachingFetcher(); // list of constructor options in next section

var deferred = caching_fetcher.fetch(backboneModel);
// or
caching_fetcher.fetch(backboneCollection);
// or
caching_fetcher.fetch([backboneModel, backboneCollection, ...]);
// or
caching_fetcher.fetch({
  toFetch: itemsToFetch, // maybe single model/collection or array of them. Required.
  success: callback, // function without params. Optional.
  fail: callback, // function without params. Optional.
  force: false, // ignore cache or not. False by default.
});

// Also there is refetch method which is explicitly set "force" to true:
caching_fetcher.refetch(backboneModel);
```

Internally it just sets *_fetched* field to true in each fetched item.

# Options

## Fetcher constructor options

| Option          | Description                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| onFetchStart    | Function to call before all fetching processes start. Get object given to **fetch** method as param.                   |
| onSuccess       | Function to call when all fetching processes are successfully finished. Get object given to **fetch** method as param. |
| onFail          | Function to call when at least one of fetching processes fails. Get object given to **fetch** method as param.         |
| onSingleSuccess | Function to call when item is successfully fetched. Get response on Backbone's **fetch** method.                       |
| onSingleFail    | Function to call when item fetching fails. Get response on Backbone's **fetch** method.                                |


Example:

```
var showLoader = function(){...};
var hideLoader = function(){...};

var caching_fetcher = new window.Backbone.CachingFetcher({
  onFetchStart: showLoader,
  onSuccess: hideLoader,
  onFail: function(){
    hideLoader();
    console.log('error');
  }
});
```

## caching_fetcher.fetch(data) options

If **data.toFetch** is blank, whole data param is transformed to this object: `{toFetch: data}`.

| Option     | Required | Description                                                                                                                                         |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| toFetch    | Required | Array of items or single item to fetch. Item may be collection or model.                                                                            |
| force      |          | Fetch item even if it is already fetched.                                                                                                           |
| success    |          | Function without arguments to call when all fetching processes are successfully finished. It is called before constructor's **onSuccess** callback. |
| fail       |          | Function without arguments to call at least one of fetching processes fails. It is called before constructor's **onFail** callback.                 |


**CachingFetcher.refetch(data)** options are similar, but **force** option is always set to _true_.

Both of these methods return jQuery promise, so you could attach your callbacks to it instead of passing functions as success/fail options.


# Requirements
Backbone, jQuery.