import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {


  // Protected routes
  this.route('threads')
  this.route('settings')
  this.route('no-messages')
  this.route('admin')

  // Open routes
  this.route('e2e')
  this.route('changes')
  this.route('legal', function () {
    this.route('privacy')
    this.route('terms')
  })
  this.route('news', function () {
    this.route('story', {path: ':story'})
  })
  this.route('downloads')
  this.route('faq')
  this.route('login')
  //this.route('pro')
  this.route('donate')
  this.route('sendleap')

})

export default Router