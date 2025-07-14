
import { View, Text} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ToolsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 text-center">Farm Tools</Text>
      </View>
      <View className="flex px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900 text-center">Coming Soon!!</Text>
      </View>
    </SafeAreaView>
  );
}
