'use strict';

/**
 * @ngdoc function
 * @name chatAppApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the chatAppApp
 */
angular.module('chatAppApp')
  .controller('MainCtrl', ['$scope', '$firebaseArray', 'chatMessages', 'auth', 'store', '$firebaseAuth', function ($scope, $firebaseArray, chatMessages, auth, store, $firebaseAuth) {


  $scope.user = "Guest " + Math.round(Math.random() * 100);

  // we add chatMessages array to the scope to be used in our ng-repeat
  $scope.messages = chatMessages;

  // a method to create new messages; called by ng-submit
  $scope.addMessage = function() {
    // calling $add on a synchronized array is like Array.push(),
    // except that it saves the changes to our Firebase database!
    $scope.messages.$add({
      from: $scope.user,
      content: $scope.message
    });

    // reset the message input
    $scope.message = "";
  };

  // if the messages are empty, add something for fun!
  $scope.messages.$loaded(function() {
    if ($scope.messages.length === 0) {
      $scope.messages.$add({
        from: "Firebase Docs",
        content: "Hello world!"
      });
    }
  });

   $scope.loginFirebase = function() {
      auth.getToken({
         api: 'firebase'
       })
      .then(function(delegation) {
         // authenticate with firebase using the token
         var fbAuth = $firebaseAuth(new Firebase("https://kiandra-chat.firebaseio.com/messages/"));

         fbAuth.$authWithCustomToken(delegation.id_token).then(function(authData) {
           // successfully authenticated with firebase

         }).catch(function(error) {
           // failed firebase authentication
           console.error("Firebase authentication failed: ", error);
         });

    }, function(error) {
      // Error getting the firebase token
      console.error("Firebase authentication failed. Unable to retrieve firebase token from Auth0.");
    });
};

	$scope.login = function() {
	  auth.signin({}, function(profile, token) {
	    // Success callback
	    store.set('profile', profile);
	    store.set('token', token);
	    $scope.user = profile.nickname;
	    $scope.loginFirebase();

	    }, function() {
	      // Error callback
	    });
	  }

	 $scope.logout = function() {
	   auth.signout();
	   var fbAuth = $firebaseAuth(new Firebase("https://kiandra-chat.firebaseio.com/messages/"));
	   fbAuth.$unauth();
	   store.remove('profile');
	   store.remove('token');
	 }

	 $scope.auth = auth;

  }]);
