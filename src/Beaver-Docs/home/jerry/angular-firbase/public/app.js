var app = angular.module('bookStore', [
    "firebase",
    "ui.router",
    "ngMaterial"
]);

app.factory('FirebaseService', function($firebaseArray, $firebaseObject, $firebaseAuth) {
    var ref = new Firebase('https://dazzling-fire-9014.firebaseio.com/-Jx8r94Bkk0f6bbbzyZQ');

    return {
        getAllPropertyArray: function() {
            return $firebaseArray(ref.child("property"));
        },
        getPropertyArray: function(index) {
            return $firebaseArray(ref.child("property").child(index));
        },
        getPropertyObject: function(index) {
            return $firebaseObject(ref.child("property").child(index));
        },
        getMessageArray: function(index) {
            return $firebaseArray(ref.child("property").child(index).child("messages"));
        },
        getMessageObject: function() {
            return $firebaseObject(ref.child("property"));
        },
        initAuth: function() {
            return $firebaseAuth(ref);
        }
    }
});

app.controller("storeCtrl", function($scope, FirebaseService) {
    var profileId = '8-the-esplanade';
    console.log("profileId: " +  profileId);

    $scope.auth = FirebaseService.initAuth();

    $scope.login = function() {
        $scope.authData = null;
        $scope.error = null;
        console.log("log in");

        $scope.auth.$authWithOAuthPopup("facebook").then(function(authData) {
            console.log("Logged in as:", authData.uid);
            $scope.authData = authData;
            console.log(authData);
            $scope.userImgUrl = $scope.authData.facebook.profileImageURL;
            $scope.userName = $scope.authData.facebook.displayName;
        }).catch(function (error) {
            console.error("Authentication failed:", error);
        });
    };

    $scope.logout = function logout() {
        console.log("log out");
        $scope.auth.$unauth();
        $scope.authData = null;
    };



    if (profileId) {
        $scope.messages = FirebaseService.getMessageArray(profileId);
        $scope.propertyObject = FirebaseService.getPropertyObject(profileId);
        $scope.postMessage = '';

        $scope.propertyObject.$loaded().then(function (result) {
            console.log($scope.propertyObject);
        });

        //prepare for image upload
        $scope.imgPath = [];
        var imageFile = null;
        $scope.imageString = '';

        //save each file in order and get thumbnails for them
        $scope.uploadFile = function uploadFile(files, index) {
            if (files[0]) {
                var fileReader = new FileReader();
                imageFile = files[0];

                fileReader.onloadend = function (e) {
                    $scope.imageString = e.target.result;

                    $scope.$apply(function () {
                        $scope.imgPath = fileReader.result;
                    });
                };
                if (imageFile) {
                    fileReader.readAsDataURL(imageFile);
                } else {
                    $scope.imgPath = '';
                }
            }
        };

        $scope.publishMsg = function publishMsg() {
            console.log("publish message");
            var postTime = new Date();

            $scope.messages.$add({
                userName: $scope.authData.facebook.displayName,
                userId: $scope.authData.auth.uid,
                userImgUrl: $scope.userImgUrl,
                body: $scope.postMessage,
                messageImg: $scope.imageString ? $scope.imageString : "",
                postTime: postTime.toDateString()
            }).then(function(ref) {
                console.log("added to message list");
                $scope.postMessage = '';
                $scope.messageImg = '';
            });
        };
    }
});

