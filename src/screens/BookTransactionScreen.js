import React, { Component } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import * as Permissions from "expo-permissions";
import { BarCodeScanner } from "expo-barcode-scanner";
import db from "../config/firebaseConfig";
import firebase from "firebase";

export default class BookTransactionScreen extends Component {
  constructor() {
    super();
    this.state = {
      askCameraPermissions: null,
      scanned: false,
      scannedData: null,
      buttonState: "normal",
      ScannedStudentId: "",
      ScannedBookId: "",
      transactionMessage: null,
    };
  }

  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      askCameraPermissions: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };

  handledBarCodeScan = async ({ type, data }) => {
    if (this.state.buttonState === "BookId") {
      this.setState({
        scanned: true,
        ScannedBookId: data,
        buttonState: "normal",
      });
    } else if (this.state.buttonState === "StudentId") {
      this.setState({
        scanned: true,
        ScannedStudentId: data,
        buttonState: "normal",
      });
    }
  };

  initiateBookIssue = async () => {
    //add a transaction
    db.collection("transaction").add({
      studentId: this.state.ScannedStudentId,
      bookId: this.state.ScannedBookId,
      data: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Issue",
    });

    //change book status
    db.collection("books").doc(this.state.ScannedBookId).update({
      bookAvailability: false,
    });
    //change number of issued books for student
    db.collection("students")
      .doc(this.state.ScannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(1),
      });
    alert("db iss");
    this.setState({
      ScannedStudentId: "",
      ScannedBookId: "",
    });
  };

  initiateBookReturn = async () => {
    //add a transaction
    db.collection("transactions").add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      date: firebase.firestore.Timestamp.now().toDate(),
      transactionType: "Return",
    });

    //change book status
    db.collection("books").doc(this.state.scannedBookId).update({
      bookAvailability: true,
    });

    //change book status
    db.collection("students")
      .doc(this.state.scannedStudentId)
      .update({
        numberOfBooksIssued: firebase.firestore.FieldValue.increment(-1),
      });

    this.setState({
      scannedStudentId: "",
      scannedBookId: "",
    });
  };

  checkStudentEligibilityForBookIssue = async () => {
    const studentRef = await db
      .collection("students")
      .where("studentId", "==", this.state.ScannedStudentId)
      .get();
    var isStudentEligible = "";
    if (studentRef.docs.length == 0) {
      this.setState({ ScannedBookId: null, ScannedStudentId: null });
      isStudentEligible = false;
      alert("Student does not exists in the database");
    } else {
      studentRef.docs.map((doc) => {
        var student = doc.data();
        if (student.numberOfBooksIssued < 2) {
          isStudentEligible = true;
        } else if (!isStudentEligible) {
          alert("Student has already issued 2 books");
        }
      });
    }
    return isStudentEligible;
  };

  checkStudentEligibilityForBookReturn = async () => {
    const transactionRef = await db
      .collection("transactions")
      .where("bookId", "==", this.state.ScannedBookId)
      .limit(1)
      .get();
    var isStudentEligible = "";
    transactionRef.docs.map((doc) => {
      var lastBookTransaction = doc.data();
      if (lastBookTransaction.studentId === this.state.ScannedStudentId) {
        isStudentEligible = true;
      } else {
        isStudentEligible = false;
        Alert.alert("The book was returned  by this student!");
        this.setState({
          ScannedStudentId: "",
          ScannedBookId: "",
        });
      }
    });
    return isStudentEligible;
  };

  checkBookEligibility = async () => {
    const bookRef = await db
      .collection("books")
      .where("bookId", "==", this.state.ScannedBookId)
      .get();
    var isBookAvailable = "";
    if (bookRef.docs.length === 0) {
      alert("Book Does not exists in the database");
      isBookAvailable = false;
    } else {
      for (var i in bookRef.docs) {
        var book = bookRef.docs[i].data();
        if (book.bookAvailability) {
          alert("Book exists in the library");
          return (isBookAvailable = "Issue");
        } else {
          alert("The Book is Returned To The Library");
        }
      }
    }
  };

  handleTransaction = async () => {
    var transactionType = await this.checkBookEligibility();
    alert("type " + transactionType);
    if (!transactionType) {
      alert("Book does not exist in the library");
      this.setState({ ScannedBookId: "", ScannedStudentId: "" });
    } else if (transactionType === "Issue") {
      var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
      if (isStudentEligible) {
        this.initiateBookIssue();
        alert("Book Issued To The Student");
      }
    } else {
      var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
      if (this.isStudentEligible) {
        this.initiateBookReturn();
        alert("Book Returned To The Student");
      }
    }
  };

  render() {
    const hasCameraPermissions = this.state.askCameraPermissions;
    const scanned = this.state.scanned;
    const ButtonState = this.state.buttonState;

    if (ButtonState !== "normal" && hasCameraPermissions) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handledBarCodeScan}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (ButtonState === "normal") {
      return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View>
            <View>
              <Text
                style={{
                  textAlign: "center",
                  alignItems: "center",
                  fontSize: 30,
                }}
              >
                Library-Management-App
              </Text>
            </View>

            <View style={styles.inputView}>
              <TextInput
                style={styles.inputBox}
                placeholder="Book Id"
                value={this.state.ScannedBookId}
                onChangeText={(bookid) => {
                  this.setState({ ScannedBookId: bookid });
                }}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => this.getCameraPermissions("BookId")}
              >
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
              <TextInput
                style={styles.inputBox}
                placeholder="Student Id"
                value={this.state.ScannedStudentId}
                onChangeText={(studentId) => {
                  this.setState({ ScannedStudentId: studentId });
                }}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => this.getCameraPermissions("StudentId")}
              >
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                this.handleTransaction();
              }}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    } else if (ButtonState !== "clicked" && !hasCameraPermissions) {
      return this.setState({ buttonState: "normal" });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  displayText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },
  scanButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    margin: 10,
  },
  buttonText: {
    fontSize: 20,
    justifyContent: "center",
    alignSelf: "center",
  },
  inputView: {
    flexDirection: "row",
    margin: 20,
  },
  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20,
  },
  scanButton: {
    backgroundColor: "#66BB6A",
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  submitButton: {
    backgroundColor: "#FBC02D",
    width: 100,
    height: 50,
    borderRadius: 10,
  },
  submitButtonText: {
    padding: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
