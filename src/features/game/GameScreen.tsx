import { View, Text, StyleSheet } from 'react-native';  

export default function GameScreen() {
    return (
        <View style={styles.container}>
            <Text>Game Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});