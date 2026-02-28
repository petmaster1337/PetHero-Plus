import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import { getHeroById } from "@/services/hero.service";
import FeedService from "@/components/FeedServices";
import FeedMessage from "@/components/FeedMessages";
import FeedReminder from "@/components/FeedReminders";

const FeedList = ({ params, hireAgain }: { params: any; hireAgain: any }) => {
  const [exists, setExists] = useState<boolean>(true);
  const [isImage, setIsImage] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);

  const router = useRouter();



  useEffect(() => {
    if (params?.message?.message?.endsWith(".jpg")) {
      setIsImage(true);
      let splitted = params?.message?.message.split("/");
      let name = splitted[splitted.length - 1];
      const baseUri = FileSystem.documentDirectory;
      setImageUri(`${baseUri}${name}`);
    }
  }, []);

  useEffect(() => {
    (async function () {
      if (isImage) {
        if (typeof params?.message?.message === "string") {
          let filedata = await FileSystem.getInfoAsync(imageUri);
          setExists(filedata.exists);
        }
      }
    })();
  }, [isImage]);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    let id = params?.contractee;
    if (typeof id !== "string") {
      id = params?.contractee?._id;
    }
    if (!id) {
      setIsAvailable(false);
      return;
    }
    const newHero = await getHeroById(id);
    setIsAvailable(newHero.length > 0);
  };

  const screenType = {
    service: () =>         
        <FeedService
          params={params}
          hireAgain={hireAgain}
          isAvailable={isAvailable}
        />,
    message: () => 
        <FeedMessage
          params={params}
          isImage={isImage}
          exists={exists}
          error={error}
          setError={setError}
          imageUri={imageUri}
        />,
        reminder: () => null
        //         <FeedReminder
        // params={params}
        // />
  }
  const returnScreen = () =>  {
    if (params?.subtype === "service") {
      return screenType.service();
     } else if (params?.subtype === "message" &&  params?.message?.subject === "reminder") {
         return screenType.reminder();
     }
     else {
      return screenType.message();
    }

  }

  return (
    <View style={[{ marginTop: 5 }, params?.subtype]} 
    key={params?.key}>
      {returnScreen()}
    </View>
  );
};

export default FeedList;

