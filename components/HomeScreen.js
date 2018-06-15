import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Button,
  RefreshControl,
  SectionList,
  Alert
} from "react-native";
import { Text, ListItem } from "react-native-elements";

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false
    };
  }

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const logoutButton = (
      <Button
        title="Logout"
        onPress={() => {
          params.clearCacheOnLogout();
          params.navigate("Login");
        }}
      />
    );
    return {
      title: "Stamp Rallies",
      headerLeft: null,
      headerRight: logoutButton
    };
  };

  componentDidMount() {
    this.props.navigation.setParams({
      setUserID: this.props.setUserID,
      navigate: this.props.navigation.navigate.bind(this)
    });
    fetch(`https://cc4-flower-dev.herokuapp.com/rallies/${this.props.userID}`)
      .then((response) => response.json())
      .then((data) => {
        this.props.loadChosenRallies(data.chosen);
        this.props.loadNotChosenRallies(data.notChosen);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getRally(data) {
    const total = data.item.locations.length;
    const progress = data.item.locations.filter((location) => location.visited)
      .length;
    return (
      <ListItem
        key={data.item.id}
        title={data.item.title}
        button
        onPress={() =>
          this.props.navigation.navigate("Details", {
            rallyID: data.item.id,
            title: data.item.title,
            locations: data.item.locations
          })
        }
        subtitle={data.item.description}
        badge={{
          value: `${progress}/${total}`,
          containerStyle: {
            marginTop: 0,
            backgroundColor: total === progress ? "dodgerblue" : "gray"
          }
        }}
      />
    );
  }

  _onRefresh() {
    this.setState({ refreshing: true });
    fetch(`https://cc4-flower-dev.herokuapp.com/rallies/${this.props.userID}`)
      .then((response) => response.json())
      .then((data) => {
        this.props.loadChosenRallies(data.chosen);
        this.props.loadNotChosenRallies(data.notChosen);
      })
      .then(() => {
        this.setState({ refreshing: false });
      })
      .catch(() => {
        Alert.alert(
          "Connection error",
          "There is a problem with the internet connection. Please try again later.",
          [{ text: "OK", onPress: () => {} }]
        );
        this.setState({ refreshing: false });
      });
  }

  render() {
    return (
      <SectionList
        renderSectionHeader={({ section: { title } }) => (
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              backgroundColor: "white"
            }}
          >
            {title}
          </Text>
        )}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
        keyExtractor={(item) => item.id}
        renderItem={(data) => this.getRally(data)}
        sections={[
          {
            title: "Your Rallies",
            data: this.props.chosenRallies
          },
          {
            title: "Find Other Rallies",
            data: this.props.notChosenRallies
          }
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44
  }
});

HomeScreen.propTypes = {
  userID: PropTypes.string.isRequired,
  setUserID: PropTypes.func.isRequired,
  loadChosenRallies: PropTypes.func.isRequired,
  loadNotChosenRallies: PropTypes.func.isRequired,
  chosenRallies: PropTypes.array.isRequired,
  notChosenRallies: PropTypes.array.isRequired,
  clearCacheOnLogout: PropTypes.func.isRequired
};
