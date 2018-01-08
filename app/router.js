import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {

  this.route('login')
  this.route('threads')

  this.route('no-messages')

  this.route('legal', function () {
    this.route('privacy')
  })

  this.route('admin')

})

export default Router