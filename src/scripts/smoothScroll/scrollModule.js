/**
 * @param { String || Array<string> } CSSClass
 * @param { string } Animation
 * @param { number } Duration
 * @returns { Object } Handles the scroll to an anchor on the same page
 */

import easingOptions from "./easingOptions.js";
import { getScrollPosition } from "./windowHelpers.js";

const defaultOptions = {
  duration: 2500,
  animation: easingOptions.easeOutCubic,
  resetTime: () => ({ start: null, now: null }),
  position: { start: 0, end: null, current: null }
};

function Scroll(opts) {
  this.options = {
    class: opts.class,
    animation: opts.animation || defaultOptions.animation,
    duration: opts.duration || defaultOptions.duration
  };
  this._time = defaultOptions.resetTime();
  this._position = defaultOptions.position;
}

function _getElementPosition(element, scrollY = getScrollPosition().y) {
  const destinationElement = document.getElementById(element.dataset.href);

  return {
    start: scrollY,
    end: element.offsetTop,
    current: scrollY
  };
}

// scrollY: the distance of the current element relative to the top of the offsetParent node
// offsetTop: the distance of the current element relative to the top of the offsetParent node

Scroll.prototype.init = function() {
  document.querySelectorAll(this.options.class).forEach(element => {
    if (
      element.href.indexOf(window.location.origin) !== -1 &&
      element.href.indexOf("#") !== -1
    ) {
      this.onScroll(element);
    }
  });
};

Scroll.prototype.onScroll = function(element) {
  element.addEventListener("click", () => {
    this._position = _getElementPosition(element);

    window.requestAnimationFrame(() => {
      this.updateState();
    });
  });
};

Scroll.prototype.updateState = function() {
  const now = new Date();

  if (this._time.start === null) {
    this._time.start = now;
    this._time.now = now;
  } else {
    this._time.now = now;
  }

  if (this._position.current < this._position.end) {
    this.onChange();
    window.requestAnimationFrame(() => this.updateState());
  } else {
    this._time = defaultOptions.resetTime();
    window.cancelAnimationFrame(this.updateState);
  }
};

// See https://github.com/cferdinandi/smooth-scroll/blob/master/dist/js/smooth-scroll.js
Scroll.prototype.onChange = function() {
  const elapsedTime = this._time.now - this._time.start;
  let progress = elapsedTime / this.options.duration;
  progress = progress >= 1 ? 1 : progress;

  this._position.current =
    this._position.start +
    this._position.end * this.options.animation(progress);
  window.scrollTo(0, this._position.current);
};

export default Scroll;
