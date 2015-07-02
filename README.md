## Project Setup

Create a folder 'chat-app'

    npm install -g grunt-cli bower yo generator-angular

    yo angular chat-app

    grunt

    grunt serve


If there's build error relating to 'sourcemap', then open Gruntfile.js and change sourcemap: true to false


## Add Firebase

In **index.html**, include the scripts:

    <!-- Firebase -->
    <script src="https://cdn.firebase.com/js/client/2.2.4/firebase.js"></script>
    <!-- AngularFire -->
    <script src="https://cdn.firebase.com/libs/angularfire/1.1.2/angularfire.min.js"></script>


In **app.js** include angular dependency for app

    var app = angular.module("sampleApp", ["firebase"]);



In **app.js**, create a chatMessages service:

    .factory("chatMessages", ["$firebaseArray",
      function($firebaseArray) {
        // create a reference to the Firebase database where we will store our data
        var ref = new     Firebase("https://kiandra-chat.firebaseio.com/messages/");

        // this uses AngularFire to create the synchronized array
        return $firebaseArray(ref);
        }
      ]);


In **controllers/main.js**, setup the controller

    angular.module('chatAppApp')
    .controller('MainCtrl', ['$scope', '$firebaseArray', 'chatMessages', function ($scope, $firebaseArray, chatMessages) {

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

    }]);


Update **views/main.html** to show messages

    <div class="panel panel-primary" ng-repeat="message in messages">
    {{message.from}}
    <p>{{message.content}}</p>
    </div>

    <div class="panel panel-info">
    <textarea ng-model="message"></textarea>
    <button class="btn btn-primary" ng-click="addMessage()">Post</button>
    </div>


###***Ta-da!*** ***Magic!***


## Add Auth0

First, turn on Firebase in Auth0, and share the firebase secret


In **index.html**, include auth0 scripts

    <!-- Auth0 Lock script and AngularJS module -->
    <script src="//cdn.auth0.com/js/lock-7.5.min.js"></script>
    <!-- angular-jwt and angular-storage -->
    <script type="text/javascript" src="//cdn.rawgit.com/auth0/angular-storage/master/dist/angular-storage.js"></script>
    <script type="text/javascript" src="//cdn.rawgit.com/auth0/angular-jwt/master/dist/angular-jwt.js"></script>

    <script src="//cdn.auth0.com/w2/auth0-angular-4.js"> </script>

    <!-- Setting the right viewport -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />



In **app.js**, add dependencies:

    angular.module('YOUR-APP-NAME', ['auth0', 'angular-storage', 'angular-jwt'])

Add to **app.js**, configure the auth0 authProvider

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


In **main.js**, add a login & logout function

    $scope.login = function() {
      auth.signin({}, function(profile, token) {
        // Success callback
        store.set('profile', profile);
        store.set('token', token);
        $scope.user = profile.nickname;
        $location.path('/');
        }, function() {
          // Error callback
        });
      }

     $scope.logout = function() {
       auth.signout();
       store.remove('profile');
       store.remove('token');
     }

     $scope.auth = auth;


In **main.html**, add login to the view


    <span>His name is {{auth.profile.nickname}}</span>

    <button ng-click="login()" ng-show="!auth.isAuthenticated">Login</button>
    <button ng-click="logout()" ng-show="auth.isAuthenticated">Logout</button>


**Must have correct callback URL configured in auth0 dashboard**

### Try it out -- ***hooray! Login works!***

## Now let's secure firebase access!

**Add firebase rule**

    ".write": "auth.uid !== null"

NOW…..

Modify **main.js** to inject $firebaseAuth into the controller, and add this function:

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

and call this during the login() callback


**ALSO**, add this to logout:

    var fbAuth = $firebaseAuth(new Firebase("https://kiandra-chat.firebaseio.com/messages/"));
    fbAuth.$unauth();
