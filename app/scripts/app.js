'use strict';

/**
 * @ngdoc overview
 * @name chatAppApp
 * @description
 * # chatAppApp
 *
 * Main module of the application.
 */
angular
  .module('chatAppApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'auth0',
    'angular-storage',
    'angular-jwt'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .config(function (authProvider) {
    authProvider.init({
      domain: 'acloudguru.auth0.com',
      clientID: 'wTh9Jaxc2fMnjLRytRtZmwa1AC4GxCeh'
    });
  })
  .run(function(auth) {
    // This hooks al auth events to check everything as soon as the app starts
    auth.hookEvents();
  })
  .factory("chatMessages", ["$firebaseArray",
  function($firebaseArray) {
    // create a reference to the Firebase database where we will store our data
    var ref = new  Firebase("https://kiandra-chat.firebaseio.com/messages/");

    // this uses AngularFire to create the synchronized array
    return $firebaseArray(ref);
    }
  ]);
