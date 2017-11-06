(function(){

    let app = angular.module('app', ['ngRoute', 'angular-jwt']);

    app.config(function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider.when('/', {
            templateUrl: './views/main.html',
            controller: 'MainController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/login', {
            templateUrl: './views/login.html',
            controller: 'LoginController',
            controllerAs: 'vm'
        });

        $routeProvider.when('/register', {
            templateUrl: './views/register.html',
            controller: 'RegisterController',
            controllerAs: 'vm'
        });

        $routeProvider.otherwise('/');

    });

    app.controller('MainController', MainController);

    function MainController($http, $location, $window, jwtHelper, $scope) {

        var vm = this;
        vm.title = "MainController";
        vm.user = null;
        vm.businesses = [];

        vm.logout = function() {
            delete $window.localStorage.token;
            vm.user = null;
            vm.businesses = [];
            $location.path('/');
        };

        vm.attend = function(bar) {
            $http.put('/api/location/' + bar.name, { user: vm.user })
                .then(function(response) {
                    vm.findBars(bar.zipCode);
                }, function(err) {
                    console.log(err);
                })
        };

        vm.cancel = function(bar) {
            $http.put('/api/location/leave/' + bar.name, { user: vm.user })
                .then(function(response) {
                    vm.findBars(bar.zipCode)
                }, function(err) {
                    console.log(err)
                });
        };

        vm.findBars = function(zip) {
            $http.get('/api/location/' + zip)
                .then(function(response) {
                    vm.businesses = response.data.businesses;
                }, function(err) {
                    console.log(err)
                });
        };

        vm.isLoggedIn = function() {
            var token = $window.localStorage.token;
            if(token === undefined) {
                return false;
            }
            else if(token && vm.businesses.length < 1) {
                var payload = jwtHelper.decodeToken(token).data;
                vm.user = payload;
                var zip = payload.location;
                $http.get('/api/location/' + zip)
                    .then(function(response) {
                        vm.businesses = response.data.businesses;
                    }, function(err) {
                        console.log(err)
                    })
            }
        }
        vm.isLoggedIn();

    };

    app.controller('LoginController', LoginController);

    function LoginController($http, $location, $window) {
        var vm = this;
        vm.title = "LoginController";

        vm.user = {
            name: '',
            password: ''
        };

        vm.login = function() {
            $http.post('/api/login', vm.user)
                .then(function(response) {
                    $window.localStorage.token = response.data;
                    $location.path('/');
                }, function(err) {
                    console.log(err)
                });
        };
    };

    app.controller('RegisterController', RegisterController);

    function RegisterController($http, $location, $window) {
        var vm = this;
        vm.title = "RegisterController";
        vm.user = {
            name: '',
            password: '',
            location: null
        };

        vm.register = function() {
            $http.post('/api/register', vm.user)
                .then(function(response) {
                    $window.localStorage.token = response.data;
                    $location.path('/');
                }, function(err) {
                    console.log(err);
                });
        };
    };
}());