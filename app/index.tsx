import { View, StyleSheet } from 'react-native';
import { GameScreen } from '../components/GameScreen';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" hidden={true} />
            <GameScreen />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});
