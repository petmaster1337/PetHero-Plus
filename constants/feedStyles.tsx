import { StyleSheet } from "react-native";
import { Colors, latitudo, altitudo } from "@/constants/Constants";

const styles = StyleSheet.create({
  heroRender: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.g1,
    backgroundColor: Colors.bg,
    borderRadius: latitudo(5),
    marginHorizontal: latitudo(2.5),
    marginBottom: altitudo(0.5),
    elevation: altitudo(0.5),
  },

  heroCard: {
    flex: 1,
    paddingHorizontal: latitudo(2.5),
    borderRadius: latitudo(5),
  },

  textBig: {
    fontFamily: "mon-b",
    fontSize: altitudo(2.5),
  },

  miniImage: {
    width: '100%',
    maxWidth: 100,
    height: 75,
    borderRadius: 6,
  },

  miniTxt: {
    fontWeight: "bold",
    fontFamily: "mon",
    fontSize: 14,
    textAlign: "justify",
    color: "#555555",
  },
});

export default styles;
