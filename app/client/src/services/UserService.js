angular.module('reg')
  .factory('UserService', [
  '$http',
  'Session',
  function($http, Session){

    var users = '/api/users';
    var base = users + '/';

    return {

      // ----------------------
      // Basic Actions
      // ----------------------
      getCurrentUser: function(){
        return $http.get(base + Session.getUserId());
      },

      get: function(id){
        return $http.get(base + id);
      },

      getAll: function(){
        return $http.get(base);
      },

      getPage: function(page, size, text){
        return $http.get(users + '?' + $.param(
          {
            text: text,
            page: page ? page : 0,
            size: size ? size : 50
          })
        );
      },

      updateProfile: function(id, profile){
        return $http.put(base + id + '/profile', {
          profile: profile
        });

        // return $http({
        //     method: 'POST',
        //     url: base + id + '/profile',
        //     headers: {
        //         'Content-Type': 'undefined'
        //     },
        //     data: {
        //       profile: profile,
        //       file: resumeFile
        //     }
        // });
        //return $http.put(base + id + '/profile', formData, { transformRequest: angular.identity}); //, headers: {'Content-Type': 'multipart/form-data'}
      },

      uploadResume: function(id, formData){
        console.log(formData);
        //const file = new FormData();
        //file.append('resume', resume, resume.name);
        console.log(formData);
        return $http.post(base + id + '/resume-drop', {file: formData});
        // return $http({
        //     method: 'POST',
        //     url: base + id + '/resume-drop',
        //     headers: {
        //         'Content-Type': 'application/pdf'
        //     },
        //     file
        // });
      },

      updateConfirmation: function(id, confirmation){
        return $http.put(base + id + '/confirm', {
          confirmation: confirmation
        });
      },

      declineAdmission: function(id){
        return $http.post(base + id + '/decline');
      },

      // ------------------------
      // Team
      // ------------------------
      joinOrCreateTeam: function(code){
        return $http.put(base + Session.getUserId() + '/team', {
          code: code
        });
      },

      leaveTeam: function(){
        return $http.delete(base + Session.getUserId() + '/team');
      },

      getMyTeammates: function(){
        return $http.get(base + Session.getUserId() + '/team');
      },

      // -------------------------
      // Admin Only
      // -------------------------

      getStats: function(){
        return $http.get(base + 'stats');
      },

      admitUser: function(id){
        return $http.post(base + id + '/admit');
      },

      checkIn: function(id){
        return $http.post(base + id + '/checkin');
      },

      checkOut: function(id){
        return $http.post(base + id + '/checkout');
      },

    };
  }
  ]);
