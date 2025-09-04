import { MAIN } from "imageConstants";
import { View, Text, Image} from "react-native";

const ChatStatsSection = () => {
  return (
    <View className="mx-4 mb-4 mt-4 rounded-2xl overflow-hidden bg-[#35353a] h-[120px] flex-row justify-end items-center gap-3 relative">
      <Image 
        source={MAIN.fuocoICON} 
        style={{
          position: 'absolute',
          width: 150, 
          height: 150, 
          left: 0, // Ajuste a posição conforme necessário
          bottom: -35,  // Ajuste a posição conforme necessário
        }}
      />

      <View className=" h-[100%] w-[60%] flex-col p-4">
        <View className="flex-row self-end justify-between items-center gap-2 rounded-2xl bg-[#1e1e1e] px-3 py-1">
            <View style = {{width: 10, height: 10, borderRadius: "100%", backgroundColor: "#ffa41f"}} />
            <Text className="text-white font-sans"> Fuoco </Text>

        </View>

      </View>
    </View>
  );
}

export default ChatStatsSection;