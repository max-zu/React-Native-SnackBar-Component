/* eslint-disable camelcase */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { Touchable } from './src';
import { noop } from './src/utils';
/*
* Values are from https://material.io/guidelines/motion/duration-easing.html#duration-easing-dynamic-durations
*/

const easing_values = {
  entry: Easing.bezier(0.0, 0.0, 0.2, 1),
  exit: Easing.bezier(0.4, 0.0, 1, 1),
};

const duration_values = {
  entry: 225,
  exit: 195,
};

const styles = StyleSheet.create({
  limit_container: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    elevation: 10,
  },
  text_msg: {
    fontSize: 14,
    flex: 1,
    paddingLeft: 20,
    paddingTop: 14,
    paddingBottom: 14,
    elevation: 10,
  },
  action_text: {
    fontSize: 14,
    fontWeight: '600',
    paddingRight: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
});

class SnackbarComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      translateValue: new Animated.Value(0),
      hideDistance: 9999,
    };
  }

  render() {
    const {
      backgroundColor,
      position,
      bottom,
      left,
      right,
      textMessage,
      actionHandler,
      actionText,
      accentColor,
      messageColor,
      styles: propsStyles,
    } = this.props;

    const {
      translateValue,
      hideDistance,
    } = this.state;

    return (
      <Animated.View
        style={[
          styles.limit_container,
          {
            height: translateValue.interpolate({
              inputRange: [0, 1], outputRange: [0, hideDistance],
            }),
            backgroundColor,
          },
          position === 'bottom' ? { bottom } : { top: bottom },
          propsStyles.limit_container,
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor,
              left,
              right,
            },
            position === 'bottom'
              ? { bottom: translateValue.interpolate({
                inputRange: [0, 1], outputRange: [hideDistance * -1, 0],
              }) }
              : { top: translateValue.interpolate({
                inputRange: [0, 1], outputRange: [hideDistance * -1, 0],
              }) },
            propsStyles.container,
          ]}
          onLayout={(event) => {
            this.setState({ hideDistance: event.nativeEvent.layout.height });
          }}
        >
          <Text
            style={[
              styles.text_msg,
              { color: messageColor },
              propsStyles.text_msg,
            ]}
          >
            {textMessage}
          </Text>
          {actionHandler && actionText &&
            <Touchable onPress={actionHandler} >
              {
                React.isValidElement(actionText)
                  ? actionText
                  : (
                    <Text
                      style={[
                        styles.action_text,
                        { color: accentColor },
                        propsStyles.action_text,
                      ]}
                    >
                      {actionText.toUpperCase()}
                    </Text>
                  )
              }
            </Touchable>
          }
        </Animated.View>
      </Animated.View>
    );
  }

  componentDidMount() {
    if (this.props.visible) {
      this.state.translateValue.setValue(1);
    } else {
      this.state.translateValue.setValue(0);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.visible) && (!this.props.visible)) {
      Animated.timing(
        this.state.translateValue,
        {
          duration: duration_values.entry,
          toValue: 1,
          easing: easing_values.entry,
        },
      ).start();
      if (nextProps.autoHidingTime) {
        setTimeout(this.props.actionHandler, nextProps.autoHidingTime);
      }
    } else if ((!nextProps.visible) && (this.props.visible)) {
      this.hideSnackbar();
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {
      visible,
      bottom,
      distanceCallback,
    } = this.props;

    const {
      hideDistance,
    } = this.state;

    if ((nextProps.visible !== visible) || (nextState.hideDistance !== hideDistance)) {
      if (nextProps.visible) {
        distanceCallback(nextState.hideDistance + bottom);
      } else {
        distanceCallback(bottom);
      }
    }
  }

  /**
   * Starting te animation to hide the snack bar.
   * @return {null} No return.
   */
  hideSnackbar() {
    Animated.timing(
      this.state.translateValue,
      {
        duration: duration_values.exit,
        toValue: 0,
        easing: easing_values.exit,
      },
    ).start();
  }

}

SnackbarComponent.defaultProps = {
  accentColor: 'orange',
  messageColor: '#FFFFFF',
  backgroundColor: '#484848',
  distanceCallback: noop,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'bottom',
  autoHidingTime: 0, // Default value will not auto hide the snack bar as the old version.
  actionHandler: noop,
  styles: {},
  textMessage: '',
  actionText: '',
  visible: false,
};

SnackbarComponent.propTypes = {
  accentColor: PropTypes.string,
  messageColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  distanceCallback: PropTypes.func,
  left: PropTypes.number,
  right: PropTypes.number,
  bottom: PropTypes.number,
  position: PropTypes.string, // bottom (default), top
  autoHidingTime: PropTypes.number, // How long (in milliseconds) the snack bar will be hidden.
  actionHandler: PropTypes.func,
  textMessage: PropTypes.string,
  styles: PropTypes.shape({
    limit_container: PropTypes.any,
    container: PropTypes.any,
    text_msg: PropTypes.any,
    action_text: PropTypes.any,
  }),
  actionText: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  visible: PropTypes.bool,
};

export default SnackbarComponent;
