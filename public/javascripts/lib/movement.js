'use strict';

define(['jquery'], function ($) {
  var actionLength = 2000;
  var isRunning = false;
  var protagonist = $('.protagonist');
  var viewport = $('#viewport');
  var talk = $('#talk');
  var inventory = $('.cloudy');
  var targets = $('.target');
  var viewScreen = 1;

  var SPEED = 8;
  var RADIUS_MAX = 90;
  var VIEWPORT_SPEED = 500;
  var VIEWPORT_LEFT = -10;
  var VIEWPORT_RIGHT = -750;
  var VIEWPORT_PANEL_MIN = 1;
  var VIEWPORT_PANEL_MAX = 3;
  var VICINITY = -30;
  var PROTAGONIST_LANDING = 120;
  var MIN_PROTAGONIST_LEFT = 110;
  var MAX_PROTAGONIST_RIGHT = 2140;
  var PANEL_SWITCH_DISTANCE = PROTAGONIST_LANDING * 2;
  var PANEL_FIRST = 1;
  var PANEL_SECOND = 2;
  var PANEL_THIRD = 3;

  var moveProtagonist = function(toX, actionLength, callback) {
    if (toX > MAX_PROTAGONIST_RIGHT) {
      toX = MAX_PROTAGONIST_RIGHT;
    } else if (toX < MIN_PROTAGONIST_LEFT) {
      toX = MIN_PROTAGONIST_LEFT;
    }

    isRunning = true;
    protagonist
      .addClass('active')
      .animate({
        left: toX
      },
      actionLength, 'linear', function() {
        protagonist.removeClass('active');
        if (callback) {
          callback();
        }
        isRunning = false;
      });
  };

  var walkAcross = function(toX, actionLength, ev) {
    var currTarget = $(ev.target);
    var viewAdjustment;

    if (currTarget.hasClass('navigation')) {
      if (viewScreen === PANEL_FIRST && currTarget[0].id === 'right') {
        viewAdjustment = VIEWPORT_RIGHT;
        viewScreen = PANEL_SECOND;

      } else if (viewScreen > PANEL_FIRST && currTarget[0].id === 'left') {
        // Add a distance buffer between panel switches for when the viewport moves.
        toX -= PANEL_SWITCH_DISTANCE;
        actionLength += PANEL_SWITCH_DISTANCE;

        if (viewScreen > PANEL_SECOND) {
          viewAdjustment = VIEWPORT_RIGHT;
          viewScreen = PANEL_SECOND;

        } else {
          viewAdjustment = VIEWPORT_LEFT;
          viewScreen = PANEL_FIRST;
        }

      } else if (viewScreen > PANEL_FIRST && currTarget[0].id === 'right') {
        viewAdjustment = VIEWPORT_RIGHT * viewScreen;
        viewScreen = PANEL_THIRD;
      }

      moveProtagonist(toX + PROTAGONIST_LANDING, actionLength, function() {
        moveViewPort(viewAdjustment);
      });

    } else {
      moveProtagonist(toX, actionLength);
    }
  };

  var moveViewPort = function(toX, callback) {
    var movable = $('.movable');

    if (toX * -1 < MAX_PROTAGONIST_RIGHT) {
      movable.animate({
        marginLeft: toX + 'px'
      },
      VIEWPORT_SPEED, function() {
        protagonist.removeClass('active');
        if (callback) {
          callback();
        }
      });
    }
  };

  var loadInventory = function(profile) {
    inventory.find('.cloudy-content').html('');
    for(var name in profile.inventory) {
      var targetImg = '<img src="' + profile.inventory[name].name +
                      '" id="' + name + '">';
      inventory.find('.cloudy-content').append(targetImg);
    }
  };

  var self = {
    // Move towards a target and stop in a specificed vicinity.
    move: function(ev) {
      if (!isRunning) {
        var toX = ev.pageX;
        var fromX = protagonist.position().left;
        var difference;

        talk.fadeOut();
        targets.removeClass('actionable');
        isRunning = true;
        protagonist.removeClass('active');

        if (viewScreen > PANEL_FIRST) {
          toX = toX + (VIEWPORT_RIGHT * -1 * (viewScreen - 1));
          fromX = fromX + (viewScreen * -1);
        }

        // Moving right
        if (fromX < toX) {
          difference = toX - fromX;
          protagonist.addClass('opposite');

        // Moving left
        } else {
          difference = fromX - toX;
          protagonist.removeClass('opposite');
        }

        actionLength = difference * SPEED;
        toX += VICINITY;
        walkAcross(toX, actionLength, ev);
      }
    },

    // Check to see if protagonist is within target radius
    withinRadius: function(selectedTarget, callback) {
      var target = selectedTarget.position().left;
      var fromX = protagonist.position().left;

      if (Math.abs(target - fromX + VICINITY) <= RADIUS_MAX ||
          Math.abs(fromX - target + (VICINITY * -1)) <= RADIUS_MAX) {
        selectedTarget.addClass('actionable');
      } else {
        selectedTarget.removeClass('actionable');
      }

      if (callback) {
        callback();
      }
    },

    // Show inventory
    showInventory: function(profile) {
      isRunning = true;
      inventory
        .css({ zIndex: 5 })
        .fadeIn(function() {
          loadInventory(profile);
        });
    },

    // Hide inventory
    hideInventory: function() {
      inventory
        .fadeOut(function() {
          isRunning = false;
        });
    }
  };

  return self;
});
