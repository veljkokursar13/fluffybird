import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import GameContainer from '../src/features/game/GameContainer'

export default function GameScreen() {
  return (
    <SafeAreaView style={gameStyles.container} edges={[]}> 
      <GameContainer />
    </SafeAreaView>
  )
}

const gameStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
})