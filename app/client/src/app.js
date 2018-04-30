var app = angular.module('reg', [
  'ui.router',
]);

app
  .config([
    '$httpProvider',
    function($httpProvider){

      // Add auth token to Authorization header
      $httpProvider.interceptors.push('AuthInterceptor');

    }])
  .run([
    'AuthService',
    'Session',
    function(AuthService, Session){
      console.log(Session)
      // Startup, login if there's  a token.
      var currentUser = window.localStorage.currentUser;
      if (currentUser && JSON.parse(currentUser).mlhToken) {
        AuthService.loginWithMLH(Session.getUser().mlhToken);
      }

      var token = Session.getToken();
      if (token){
        AuthService.loginWithToken(token);
      }
  }]);