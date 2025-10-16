/* ==========================================================================
   Hero Snap Scrolling
   Automatically snaps to the closest hero element when scrolling stops
   ========================================================================== */

$(document).ready(function() {
    var $window = $(window);
    var $heroElements = $('.hero.snapscroll');
    
    // Only enable snap scrolling if there are hero elements
    if ($heroElements.length === 0) {
        return;
    }
    
    var scrollTimeout;
    var isSnapping = false;
    
    // Close all Read More sections across heroes and reset compact state
    function closeAllReadMore() {
        $heroElements.each(function() {
            var $hero = $(this);
            // Hide any open content panels
            $hero.find('.valueprop-hero__carousel').removeClass('is-visible');
            // Reset header state and show the Read More control
            $hero.find('.valueprop-hero__top').removeClass('is-compact');
            $hero.find('.valueprop-hero__read-more').removeClass('is-hidden');
            // Re-enable snapping for heroes that were disabled
            $hero.removeClass('snap-disabled');
        });
    }
    
    // Heroes eligible for snapping (exclude those with open Read More)
    function getSnapCandidates() {
        return $heroElements.filter(':not(.snap-disabled)');
    }
    
    function checkSnapScroll() {
        if (isSnapping) return;
        
        var $candidates = getSnapCandidates();
        if ($candidates.length === 0) return;
        
        var scrollTop = $window.scrollTop();
        var windowHeight = $window.height();
        var viewportMiddle = scrollTop + (windowHeight / 2);
        
        var closestHero = null;
        var closestDistance = windowHeight / 2;
        
        // Find the closest hero to viewport middle
        $candidates.each(function() {
            var $hero = $(this);
            var heroTop = $hero.offset().top;
            var heroHeight = $hero.outerHeight();
            var heroMiddle = heroTop + (heroHeight / 2);
            var distance = Math.abs(viewportMiddle - heroMiddle);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestHero = $hero;
            }
        });
        
        // Always snap to the closest hero
        if (closestHero) {
            var targetScrollTop = closestHero.offset().top;
            
            // Only animate if we're not already at the target
            if (Math.abs(scrollTop - targetScrollTop) > 5) {
                isSnapping = true;
                // Before snapping, close all Read More sections
                closeAllReadMore();
                $('html, body').animate({
                    scrollTop: targetScrollTop
                }, 300, function() {
                    isSnapping = false;
                });
            }
        }
    }
    
    // Listen for scroll events
    $window.on('scroll', function() {
        // Clear existing timeout
        clearTimeout(scrollTimeout);
        
        // Set new timeout to check snap after user stops scrolling
        scrollTimeout = setTimeout(function() {
            if (!isSnapping) {
                checkSnapScroll();
            }
        }, 150);
    });
    
    // When Read More is opened, disable snap for that hero only
    $(document).on('click', '.valueprop-hero__read-more-btn', function() {
        var $hero = $(this).closest('.hero.snapscroll');
        if ($hero.length) {
            $hero.addClass('snap-disabled');
        }
    });
    
    // When the section is closed, re-enable snap for that hero
    $(document).on('click', '.valueprop-hero__nav-btn--close', function() {
        var $hero = $(this).closest('.hero.snapscroll');
        if ($hero.length) {
            $hero.removeClass('snap-disabled');
        }
    });
});
