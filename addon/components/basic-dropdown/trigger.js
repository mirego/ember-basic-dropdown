import layout from '../../templates/components/basic-dropdown/trigger';
import $ from 'jquery';
import Component from 'ember-component';
import computed from 'ember-computed';

const isTouchDevice = (!!self.window && 'ontouchstart' in self.window);

function trueStringIfPresent(path) {
  return computed(path, function() {
    if (this.get(path)) {
      return 'true';
    } else {
      return null;
    }
  });
}

export default Component.extend({
  layout,
  isTouchDevice,
  classNames: ['ember-basic-dropdown-trigger'],
  role: 'button',
  tabindex: 0,
  'aria-haspopup': true,
  classNameBindings: ['inPlaceClass', 'hPositionClass', 'vPositionClass'],
  attributeBindings: [
    'role',
    'tabIndex:tabindex',
    'dropdownId:aria-controls',
    'ariaLabel:aria-label',
    'ariaLabelledBy:aria-labelledby',
    'ariaDescribedBy:aria-describedby',
    'aria-disabled',
    'aria-expanded',
    'aria-haspopup',
    'aria-invalid',
    'aria-pressed',
    'aria-required'
  ],

  // Lifecycle hooks
  init() {
    this._super(...arguments);
    let dropdown = this.get('dropdown');
    this.elementId = `ember-basic-dropdown-trigger-${dropdown._id}`;
    this.dropdownId = this.dropdownId || `ember-basic-dropdown-content-${dropdown._id}`;
    this._touchMoveHandler = this._touchMoveHandler.bind(this);
  },

  didInsertElement() {
    this._super(...arguments);
    this.addMandatoryHandlers();
    this.addOptionalHandlers();
  },

  willDestroyElement() {
    this._super(...arguments);
    this.get('appRoot').removeEventListener('touchmove', this._touchMoveHandler);
  },

  // CPs
  'aria-disabled': trueStringIfPresent('dropdown.disabled'),
  'aria-expanded': trueStringIfPresent('dropdown.isOpen'),
  'aria-invalid': trueStringIfPresent('ariaInvalid'),
  'aria-pressed': trueStringIfPresent('dropdown.isOpen'),
  'aria-required': trueStringIfPresent('ariaRequired'),

  tabIndex: computed('dropdown.disabled', 'tabIndex', function() {
    return this.get('dropdown.disabled') ? -1 : (this.get('tabindex') || 0);
  }),

  inPlaceClass: computed('renderInPlace', function() {
    if (this.get('renderInPlace')) {
      return 'ember-basic-dropdown-trigger--in-place';
    }
  }),

  hPositionClass: computed('hPosition', function() {
    let hPosition = this.get('hPosition');
    if (hPosition) {
      return `ember-basic-dropdown-trigger--${hPosition}`;
    }
  }),

  vPositionClass: computed('vPosition', function() {
    let vPosition = this.get('vPosition');
    if (vPosition) {
      return `ember-basic-dropdown-trigger--${vPosition}`;
    }
  }),

  // Actions
  actions: {
    handleMousedown(e) {
      let dropdown = this.get('dropdown');
      if (e && e.defaultPrevented || dropdown.disabled) {
        return;
      }
      this.stopTextSelectionUntilMouseup();
      dropdown.actions.toggle(e);
    },

    handleTouchEnd(e) {
      let dropdown = this.get('dropdown');
      if (e && e.defaultPrevented || dropdown.disabled) {
        return;
      }
      if (!this.hasMoved) {
        dropdown.actions.toggle(e);
      }
      this.hasMoved = false;
      this.get('appRoot').removeEventListener('touchmove', this._touchMoveHandler);
    },

    handleKeydown(e) {
      let dropdown = this.get('dropdown');
      if (dropdown.disabled) {
        return;
      }
      let onKeydown = this.get('onKeydown');
      if (onKeydown && onKeydown(dropdown, e) === false) {
        return;
      }
      if (e.keyCode === 13) {  // Enter
        dropdown.actions.toggle(e);
      } else if (e.keyCode === 32) { // Space
        e.preventDefault(); // prevents the space to trigger a scroll page-next
        dropdown.actions.toggle(e);
      } else if (e.keyCode === 27) {
        dropdown.actions.close(e);
      }
    }
  },

  // Methods
  _touchMoveHandler() {
    this.hasMoved = true;
    this.get('appRoot').removeEventListener('touchmove', this._touchMoveHandler);
  },

  stopTextSelectionUntilMouseup() {
    let $appRoot = $(this.get('appRoot'));
    let mouseupHandler = function() {
      $appRoot[0].removeEventListener('mouseup', mouseupHandler, true);
      $appRoot.removeClass('ember-basic-dropdown-text-select-disabled');
    };
    $appRoot[0].addEventListener('mouseup', mouseupHandler, true);
    $appRoot.addClass('ember-basic-dropdown-text-select-disabled');
  },

  addMandatoryHandlers() {
    if (this.get('isTouchDevice')) {
      this.element.addEventListener('touchstart', () => {
        this.get('appRoot').addEventListener('touchmove', this._touchMoveHandler);
      });
      this.element.addEventListener('touchend', (e) => {
        this.send('handleTouchEnd', e);
        e.preventDefault(); // Prevent synthetic click
      });
    }
    this.element.addEventListener('mousedown', (e) => this.send('handleMousedown', e));
    this.element.addEventListener('keydown', (e) => this.send('handleKeydown', e));
  },

  addOptionalHandlers() {
    let dropdown = this.get('dropdown');
    let onMouseEnter = this.get('onMouseEnter');
    if (onMouseEnter) {
      this.element.addEventListener('mouseenter', (e) => onMouseEnter(dropdown, e));
    }
    let onMouseLeave = this.get('onMouseLeave');
    if (onMouseLeave) {
      this.element.addEventListener('mouseleave', (e) => onMouseLeave(dropdown, e));
    }
    let onFocus = this.get('onFocus');
    if (onFocus) {
      this.element.addEventListener('focus', (e) => onFocus(dropdown, e));
    }
    let onBlur = this.get('onBlur');
    if (onBlur) {
      this.element.addEventListener('blur', (e) => onBlur(dropdown, e));
    }
    let onFocusIn = this.get('onFocusIn');
    if (onFocusIn) {
      this.element.addEventListener('focusin', (e) => onFocusIn(dropdown, e));
    }
    let onFocusOut = this.get('onFocusOut');
    if (onFocusOut) {
      this.element.addEventListener('focusout', (e) => onFocusOut(dropdown, e));
    }
  }
});
