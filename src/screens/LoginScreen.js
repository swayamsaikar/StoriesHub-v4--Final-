import React, { Component } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import firebase from "firebase";

export default class LoginScreen extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
    };
  }

  login = async (email, password) => {
    if (email && password) {
      try {
        const auth = await firebase
          .auth()
          .signInWithEmailAndPassword(email, password);

        if (auth) {
          this.props.navigation.navigate("BookTransactionsScreen");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View>
          <Image
            source={require("../../assets/booklogo.jpg")}
            style={{ width: 200, height: 200 }}
          />
          <Text style={{ fontSize: 20, textAlign: "center" }}>Wily App</Text>
        </View>

        <TextInput
          style={[styles.loginBox, { outline: "none" }]}
          value={this.state.email}
          placeholder="abc@gmail.com"
          keyboardType="email-address"
          onChangeText={(email) => this.setState({ email: email })}
        />
        <TextInput
          style={[styles.loginBox, { outline: "none" }]}
          value={this.state.password}
          placeholder="password"
          secureTextEntry={true}
          onChangeText={(pass) => this.setState({ password: pass })}
        />

        <TouchableOpacity
          onPress={() => {
            this.login(this.state.email, this.state.password);
          }}
          style={{
            height: 30,
            width: 90,
            borderWidth: 1,
            marginTop: 20,
            borderRadius: 7,
          }}
        >
          <Text style={{ textAlign: "center" }}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginBox: {
    width: 300,
    height: 40,
    borderWidth: 1.5,
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
});
