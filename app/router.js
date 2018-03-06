import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {

  this.route('login')
  this.route('threads')
  this.route('settings') // note that this is a protected route.

  this.route('no-messages')

  this.route('legal', function () {
    this.route('privacy')
    this.route('terms')
  })

  this.route('admin')

  this.route('faq')

  this.route('news', function () {
    this.route('story', {path: ':story'})
  })

  this.route('beta', function () {
    this.route('windows')
  })

  this.route('downloads')

})

export default Router