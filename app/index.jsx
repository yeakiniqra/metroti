import { Text, View,ActivityIndicator } from "react-native";


export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading</Text>
      <ActivityIndicator size="large" />
    </View>
  );
}
