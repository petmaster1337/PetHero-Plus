import { StyleSheet } from 'react-native';
import { altitudo, Constants, latitudo, Colors } from './Constants';


export const Styles = StyleSheet.create({

  bottomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: altitudo(1.618),
    paddingHorizontal: '5%',
    width: '75%',
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: latitudo(2 * 1.618),
    borderColor: 'black',
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 3
  },
 
  bottomButtonText: {
    color: 'black',
    fontSize: altitudo(1.618),
    fontFamily: 'mon',
  },

  imgAvatar: {
    height: '75%',
    aspectRatio: 1,
    borderRadius: 500,
  }
});














export const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFFFF',
  },
  inputField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ABABAB',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'mon-b',
  },
  btnIcon: {
    position: 'absolute',
    left: 16,
  },
  footer: {
    position: 'absolute',
    height: 100,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: Colors.g1,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});