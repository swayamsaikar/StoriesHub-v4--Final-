import React, { Component } from "react";
import { Image } from "react-native";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";
import BookTransactionScreen from "./screens/BookTransactionScreen";
import searchScreen from "./screens/searchScreen";
import LoginScreen from "./screens/LoginScreen";

export class Navigator extends Component {
  render() {
    return <AppContainer />;
  }
}

export default Navigator;

const AppNavigator = createBottomTabNavigator(
  {
    searchScreen: {
      screen: searchScreen,
    },
    BookTransactionsScreen: {
      screen: BookTransactionScreen,
    },
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: () => {
        const { routeName } = navigation.state;
        console.log(routeName);
        if (routeName === "BookTransactionScreen") {
          return (
            <Image
              source={require("../assets/book.png")}
              style={{ height: 40, width: 40 }}
            />
          );
        } else if (routeName === "searchScreen") {
          return (
            <Image
              source={require("../assets/book.png")}
              style={{ height: 40, width: 40 }}
            />
          );
        }
      },
    }),
  }
);

const Switch = createSwitchNavigator({
  LoginScreen: {
    screen: LoginScreen,
  },
  AppNavigator: {
    screen: AppNavigator,
  },
});

const AppContainer = createAppContainer(Switch);
