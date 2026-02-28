import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from "expo-image-picker";

export async function compressImage(imageUri: string): Promise<string> {
    try {
        const { uri } = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 720 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        const newFilePath = `${FileSystem.documentDirectory}_${Math.floor(Math.pow(32, 5) * Math.random()).toString(16)}.jpg`;
        await FileSystem.moveAsync({
            from: uri,
            to: newFilePath,
        });

        console.log("Image compressed successfully:", newFilePath);
        return newFilePath;
    } catch (error) {
        console.log("Error in compressImage:", error);
        return '';
    }
}
