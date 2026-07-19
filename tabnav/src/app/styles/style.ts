import { StyleSheet } from 'react-native';

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCC',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#07F',
    backgroundColor: '#CCC',
    textAlign: 'center',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ced: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(135, 11, 11, 1)',
    backgroundColor: '#CCC',
    textAlign: 'center',
    padding: 10
  },
});
