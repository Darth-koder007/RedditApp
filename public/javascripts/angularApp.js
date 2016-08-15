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