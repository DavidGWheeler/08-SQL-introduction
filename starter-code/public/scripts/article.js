'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.loadAll
 * - This declares an anonymous function which will load all of the data of Article objects.
 * - Inputs: takes an input of rows from the following anonymous functions in order to organize the data into the appropriate locat};ion in the article.
 * - Outputs: outputs all rows of Articles.
 */
Article.loadAll = function(rows) {
  // DONE: rows.sort uses the .sort method on rows (an array of Article objects) and takes the arguments of (a, b) which compares two Date objects to sort rows by the publishedOn data for that element within index.html
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: this uses the forEach() method on rows to iterate through each row then outputs an "ele" argument and loads all data into each of the Article objects by using the push method to Articles.all.
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - this method fetches all the data from hackerIpsum.json
 * - Inputs: callback is taken as an argument from the if statement below.
 * - Outputs: outputs the JSON data found in hackerIpsum.json into Article objects.
 */
Article.fetchAll = function(callback) {
  // DONE: this uses jQuery .get() method to retrieve the articles element
  $.get('/articles')
  // DONE: uses the jQuery .then() to defer the handling of .get('/articles') until it is resolved, then evaluates if records exist in the DB.  If true then it instantiates the Article.loadAll().
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: instantiates the loadAll method on Articles with a parameter of results with a callback to load the results of the DB query and then allows initIndexPage to be called.
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // DONE: uses jQuery method getJSON() on the data stored at ./data/hackerIpsum.json to retrieve the data in that file in JSON format, and inserts a record of this data into our database using the forEach() method on rawData.
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: uses the .then() method to wait until all the data has been inserted into the DB then calls back up to Article.fetchAll and then loads everything with results and appends everything to the document.
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: uses .catch() method to catch anything that returns with err arguemnt and log the error to console
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Truncates (deletes) the the data in the SQL table.
 * - Inputs: takes a param of "callback" from the if statment
 * - Outputs: a SQL command to delete all data from the table '/articles'
 */

Article.truncateTable = function(callback) {
  // DONE: uses a jQuery AJAX call to '/articles' in server.js with a method of 'DELETE'
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: Uses the .then() method to defer handling of the truncateTable function until all the data has been deleted then logs the data to the console (delete complete) should be returned.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - this method on the prototype of Articles inserts records into our DB using the .post() method.
 * - Inputs: takes a parameter of callback
 * - Outputs: places rows of our data into the DB.
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: uses jQuery.post method to insert records into rows of the articles DB.
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: uses the .then method to defer the handling of the .post method until it is complete and then log data and call the callback function.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method deletes a given row from our DB
 * - Inputs: takes an argument of callback
 * - Outputs: a DELETE method on a particular article id.
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: using a jQuery ajax call to the template literal url of: `/articles/${this.article_id}` and calling a method of DELETE to remove the row associated with that article_id.
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: uses the .then method to defer the handing of the callback until the DELETE method has completed, then logs data and calls callback().
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - updates records in the DB.
 * - Inputs: takes an input of callback
 * - Outputs: outputs an update (PUT) method to the template lilteral url of `/articles${this.article_id}`
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: uses a jQuery ajax call to the url of template literal  `/articles/${this.article_id}` to insert the current instance of article_id into the DB via a PUT method.
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: this object describes the current instance of Article to be put into the DB using key value pairs.
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: .this method defers the function until the updateRecord method is complete, then logs data and fires off the callback() function.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
