(function(window, angular, undefined) {

    'use strict';

    angular.module('ksSwiper', [])
        .directive('ksSwiperContainer', SwiperContainer)
        .directive('ksSwiperSlide', SwiperSlide);

    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    }

    /* @ngInject */
    function SwiperContainer() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                onReady: '&',
                swiper: '=',
                overrideParameters: '='
            },
            controller: function($scope, $element, $timeout) {
                var uuid = createUUID();

                $scope.swiper_uuid = uuid;
            },

            link: function(scope, element) {
                var uuid = scope.swiper_uuid;
                var containerElement = element[0];
                var paginatorId = "paginator-" + uuid;
                var prevButtonId = "prevButton-" + uuid;
                var nextButtonId = "nextButton-" + uuid;
                var scrollBarId = 'scrollBar-' + uuid;

                angular.element(containerElement.querySelector('.swiper-pagination'))
                    .attr('id', paginatorId);

                angular.element(containerElement.querySelector('.swiper-button-next'))
                    .attr('id', nextButtonId);

                angular.element(containerElement.querySelector('.swiper-button-prev'))
                    .attr('id', prevButtonId);

                angular.element(element[0].querySelector('.swiper-scrollbar'))
                    .attr('id', scrollBarId);

                function applyParams() {
                    // directive defaults
                    var params = {
                        slidesPerView: 1,
                        slidesPerColumn: 1,
                        spaceBetween: 0,
                        direction: 'horizontal',
                        loop: false,
                        initialSlide: 0,
                        showNavButtons: false
                    };

                    if (scope.overrideParameters) {
                        params = angular.extend({}, params, scope.overrideParameters);
                    }

                    if (params.paginationIsActive === true) {
                        params = angular.extend({}, params, {
                            paginationClickable: scope.paginationClickable || true,
                            pagination: '#paginator-' + scope.swiper_uuid
                        });
                    }

                    if (params.showNavButtons) {
                        params.nextButton = '#nextButton-' + scope.swiper_uuid;
                        params.prevButton = '#prevButton-' + scope.swiper_uuid;
                    }

                    if (params.showScrollBar) {
                        params.scrollbar = '#scrollBar-' + scope.swiper_uuid;
                    }

                    return params;
                }

                function initSwiper() {
                    scope.swiper = new Swiper(element[0].firstChild, scope.params);
                }

                function destroySwiper() {
                    scope.swiper.destroy(true, true);
                }

                // Update on settings has been changed (object link detection)
                scope.$watch('overrideParameters', function() {
                    scope.params = applyParams();
                    if (scope.swiper && scope.swiper.slides) {
                        destroySwiper();
                    }
                    window.requestAnimationFrame(initSwiper);
                });
            },

            template:
                '<div class="swiper-container {{params.containerCls}}">' +
                    '<div class="parallax-bg" data-swiper-parallax="{{params.parallaxTransition}}" ng-show="parallax"></div>' +
                    '<div class="swiper-wrapper {{params.wrapperCls}}" ng-transclude></div>' +
                    '<div class="swiper-scrollbar" ng-show="params.showScrollBar"></div>' +
                '</div>' +
                '<div class="swiper-pagination {{params.paginationCls}}"></div>' +
                '<div class="swiper-button-next" ng-show="params.showNavButtons"></div>' +
                '<div class="swiper-button-prev" ng-show="params.showNavButtons"></div>' +
                ''
        };
    }

    /* @ngInject */
    function SwiperSlide() {
        return {
            restrict: 'E',
            require: '^ksSwiperContainer',
            transclude: true,
            scope: {
              sliderCls: '@',
            },
            template: '<div class="swiper-slide {{sliderCls}}" ng-transclude></div>',
            replace: true
        };
    }

})(window, angular, undefined);
