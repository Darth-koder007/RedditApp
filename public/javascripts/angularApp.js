var app = angular.module('flapperNews', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state ('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl'
        })
        .state('posts',{
            url:'/posts/{id}',
            templateUrl:'/posts.html',
            controller:'PostsCtrl'
        });

        $urlRouterProvider.otherwise('home');
}]);

app.factory('posts', [function(){
    
    var o = {
        posts : []
    };

    return o;
}]);

app.controller('MainCtrl',['$scope','posts', function($scope, posts){

    $scope.posts = posts.posts;
    // $scope.posts = [
    //     { title: 'post 1', upvotes: 5 },
    //     { title: 'post 2', upvotes: 4 },
    //     { title: 'post 3', upvotes: 1 },
    //     { title: 'post 4', upvotes: 3 },
    //     { title: 'post 5', upvotes: 2 }
    // ];

    $scope.addPost = function () {
        
        if (!$scope.title || $scope.title === '') { 
            return; 
        }

        var newPost = { 
            title : $scope.title,
            link: $scope.link,
            upvotes : 0,
            comments: [] 
        };

        $scope.posts.push (newPost);
        $scope.title = '';
        $scope.link = '';
    };

    $scope.incrementUpvotes = function (post) {
        post.upvotes += 1;
    };


}]);

app.controller('PostsCtrl', ['$scope', '$stateParams', 'posts', function ($scope, $stateParams, posts) {

   $scope.post = posts.posts[$stateParams.id];

   $scope.addComment = function () {
       if ($scope.body === '') {
           return;
       }
       var newComment = {
           body : $scope.body,
           author : $scope.author,
           upvotes :0
       };

       $scope.post.comments.push(newComment);
       $scope.body = '';
       $scope.author = '';
   };

   $scope.incrementUpvotes = function (comment) {
        comment.upvotes += 1;
    };

}]);