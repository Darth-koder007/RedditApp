var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state ('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl',
            resolve: {
                postPromise: ['posts', function(posts) {
                    return posts.getAll();
                }]
            }
        })
        .state('posts',{
            url:'/posts/{id}',
            templateUrl:'/posts.html',
            controller:'PostsCtrl',
            resolve: { 
               post: ['$stateParams','posts', function($stateParams, posts) {
                   return posts.get($stateParams.id);
               }] 
            }
        });

        $urlRouterProvider.otherwise('home');
}]);

app.factory('auth', ['$http', '$window', function ($http, $window){
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['flapper-news-toke'];
    };

    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse($window.atob.split('.')[1]);

            return payload.exp > Date.now() / 1000;
        }
        else {
            return false;
        }
    };

    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function(){
            auth.saveToken(data.token);
        });
    };

    auth.login = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function () {
        $window.localStorage.removeItem('flapper-news-token');
    };

    return auth;
}]);

app.factory('posts', ['$http', function($http){
    
    var o = {
        posts : []
    };

    //load all post from API when page is loaded
    o.getAll = function() {
        return $http.get('/posts').success(function(data){
            angular.copy(data,o.posts);
        });
    };

    //Load single post
    o.get = function (id) {
        return $http.get('/posts/' + id)
            .then(function (res) {
                return res.data;
            });
    };

    //Create new post 
    o.create = function(post) {
        return $http.post('/posts', post).success(function(data){
            o.posts.push(data);
        });
    };

    //Upvote a post
    o.upvote = function (post) {
        return $http.put('/posts/'+post._id+'/upvote')
            .success(function(data) {
                post.upvotes += 1;
            });
    };

    //add comment to the respective post
    o.addComment = function (id, comment) {
        return $http.post('/posts/' + id + '/comments',comment);
    };

    //Upvote a comment 
    o.upvoteComment = function (post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
               .success(function(data){
                   comment.upvotes += 1;
               });
    };

    return o;
}]);

app.controller('MainCtrl',['$scope','posts', function($scope, posts){

    $scope.posts = posts.posts;

    $scope.addPost = function () {
        
        if (!$scope.title || $scope.title === '') { 
            return; 
        }

        var newPost = { 
            title : $scope.title,
            link: $scope.link
        };

        posts.create(newPost);
        $scope.title = '';
        $scope.link = '';
    };

    $scope.incrementUpvotes = function (post) {
        posts.upvote(post);
    };


}]);

app.controller('PostsCtrl', ['$scope','posts','post', function ($scope, posts, post) {

   $scope.post = post;

   $scope.addComment = function () {
       if ($scope.body === '') {
           return;
       }
       var newComment = {
           body : $scope.body,
           author : $scope.author,
       };

       posts.addComment(post._id, {
           body: $scope.body,
           author:$scope.author,
        }).success(function(comment){
            $scope.post.comments.push(comment);
        });

       $scope.body = '';
       $scope.author = '';
   };

   $scope.incrementUpvotes = function (comment) {
        posts.upvoteComment(post, comment);
    };

}]);

app.controller('AuthCtrl', ['$scope','$state','auth', function ($scope, $state, auth) {
    $scope.user = {};

    $scope.register = function () {
        auth.register($scope.user).error(function(error){
            $scope.error = error;
        }).then(function (){
            $state.go('home');
        });
    };

    $scope.login = function () {
        auth.login($scope.user).error(function(error){
            $scope.error = error;
        }).then(function(){
            $state.go('home');
        });
    };
}]);